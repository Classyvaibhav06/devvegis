# DevVegis — Production Deployment & Operations Manual

> **Document Target Audience**: Engineering Manager (EM), DevOps / SRE Engineers, and Full-Stack Tech Leads.  
> **Purpose**: Complete guide to take the DevVegis development codebase, configure production infrastructure, execute migrations, and deploy scalable frontends and backends with zero downtime.

---

## 1. System Architecture & Topology

DevVegis is designed as a decoupled, micro-service-ready monorepo comprising:
1. **Frontend App**: Next.js 15 (React 19 App Router) serving SSR, ISR, and dynamic client routing.
2. **Backend API**: Node.js 20+ / Express with TypeScript, Prisma ORM, and Winston logging.
3. **Database**: PostgreSQL 16+ on **Neon** (serverless with PgBouncer connection pooling).
4. **Object Storage**: S3-compatible bucket on **Neon Object Storage** (or AWS S3 / Cloudflare R2).
5. **Transactional Email**: **Resend API** for 4-digit order delivery OTPs and transactional notifications.
6. **Payment Gateway**: **Razorpay** (supporting UPI, Cards, Net Banking, and COD fallback).

### Recommended Deployment Topologies

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TOPOLOGY A: MODERN PAAS (RECOMMENDED)           │
│                                                                        │
│   Frontend (Next.js)      ──►  Vercel / Cloudflare Pages              │
│   Backend (Express API)   ──►  Render / Railway / DigitalOcean App     │
│   Database (Postgres)     ──►  Neon (Serverless, Pooled)              │
│   Storage (Media/Images)  ──►  Neon S3 / Cloudflare R2                 │
│   Email Engine            ──►  Resend (Custom Domain)                  │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                        TOPOLOGY B: SELF-HOSTED DOCKER / VPS            │
│                                                                        │
│   Incoming Traffic        ──►  Nginx / Caddy (SSL + HTTP/2 Reverse)    │
│   Frontend Container      ──►  Docker (Next.js standalone output)      │
│   Backend Container       ──►  Docker (Node.js Express dist)           │
│   Cloud Database          ──►  Neon Postgres                           │
│   Cloud Storage           ──►  Neon S3 / AWS S3                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Environment Variables Matrix

Every variable required by the application is documented below. Configure these in your deployment platform's secret manager.

### 2.1 Backend Environment Variables (`server/.env`)

| Variable | Required | Default / Format | Description & Production Guidance |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **YES** | `production` | Set to `production` to enable caching and disable stack-trace leaks. |
| `PORT` | **YES** | `5000` | Port for the Express server to listen on. |
| `DATABASE_URL` | **YES** | `postgresql://user:pass@ep-xyz-pooler.us-east-2.aws.neon.tech/devvegis_db?sslmode=require&pgbouncer=true` | **Use Neon's Pooled connection string**. Append `&connect_timeout=30&pool_timeout=30`. |
| `JWT_ACCESS_SECRET` | **YES** | Minimum 64-char random string | Secret for signing short-lived access JWTs. Generate with `openssl rand -hex 32`. |
| `JWT_REFRESH_SECRET`| **YES** | Minimum 64-char random string | Secret for signing 7-day refresh tokens. Must differ from access secret. |
| `JWT_ACCESS_EXPIRES_IN`| NO | `15m` | Lifetime of access token. |
| `JWT_REFRESH_EXPIRES_IN`| NO | `7d` | Lifetime of refresh token. |
| `CORS_ORIGIN` | **YES** | `https://devvegis.com,https://admin.devvegis.com` | Comma-separated list of allowed production frontend domains. Do NOT use `*` in production. |
| `APP_URL` | **YES** | `https://devvegis.com` | Public root URL of the customer-facing frontend. |
| `API_URL` | **YES** | `https://api.devvegis.com` | Public root URL of this backend API. |
| `RESEND_API_KEY` | **YES** | `re_xxxxxxxxxxxxxxxx` | Resend API key for delivering Order Delivery OTP emails. |
| `EMAIL_FROM` | **YES** | `DevVegis <orders@devvegis.com>` | Verified sender address in Resend. |
| `AWS_ACCESS_KEY_ID` | **YES** | Alphanumeric string | S3 Access Key for Neon Object Storage or AWS S3. |
| `AWS_SECRET_ACCESS_KEY` | **YES** | Secret key string | S3 Secret Key for Neon Object Storage or AWS S3. |
| `AWS_ENDPOINT_URL_S3` | **YES** | `https://storage.us-east-2.aws.neon.tech` | S3 endpoint URL (omit or leave empty if using native AWS S3). |
| `AWS_REGION` | **YES** | `us-east-2` | S3 region where bucket is hosted. |
| `AWS_BUCKET_NAME` | **YES** | `uploads` (or your bucket name) | S3 bucket name for product images and receipts. |
| `RAZORPAY_KEY_ID` | **YES** | `rzp_live_xxxxxxxx` | Razorpay Live API Key ID. |
| `RAZORPAY_KEY_SECRET` | **YES** | Secret string | Razorpay Live Key Secret. |
| `DELIVERY_FEE` | NO | `25` | Base delivery charge in INR (₹). |
| `FREE_DELIVERY_ABOVE` | NO | `199` | Subtotal in INR above which delivery is free. |
| `GST_RATE` | NO | `0.05` | Goods & Services Tax multiplier (5%). |

### 2.2 Frontend Environment Variables (`client/.env.production`)

| Variable | Required | Default / Format | Description |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **YES** | `https://api.devvegis.com/api/v1` | Public API base URL used by client browsers to communicate with Express. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`| **YES** | `rzp_live_xxxxxxxx` | Public Razorpay key ID for launching checkout modals on the client. |

---

## 3. External Services Onboarding Checklist

### 3.1 Neon PostgreSQL Database Setup
1. Create a project on [Neon.tech](https://console.neon.tech).
2. Choose a region closest to your backend server (e.g. `us-east-2` or `ap-southeast-1` Singapore / Mumbai).
3. From the Neon dashboard, navigate to **Dashboard** $\rightarrow$ **Connection Details**.
4. Select **Pooled connection** (uses PgBouncer, port 6543) to prevent connection saturation under serverless scale.
5. In your production `.env`, set `DATABASE_URL`:
   ```bash
   DATABASE_URL="postgresql://[USER]:[PASSWORD]@[ENDPOINT]-pooler.[REGION].aws.neon.tech/[DB_NAME]?sslmode=require&connect_timeout=30&pool_timeout=30&pgbouncer=true"
   ```

### 3.2 Neon Object Storage (S3 Images & Media)
1. In your Neon Project dashboard, enable **Object Storage**.
2. Create a bucket named `uploads`.
3. Generate an S3 Access Key pair from the Neon console.
4. Set the CORS policy on the bucket to allow `PUT` and `GET` requests from your frontend domains:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
       "AllowedOrigins": ["https://devvegis.com", "https://*.devvegis.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
5. Supply `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, and `AWS_BUCKET_NAME` to the backend.

### 3.3 Resend Transactional Email Setup
1. Create an account at [resend.com](https://resend.com).
2. Go to **Domains** $\rightarrow$ **Add Domain** (e.g. `devvegis.com` or `mail.devvegis.com`).
3. Add the 3 required DNS records to your DNS provider:
   - `TXT` for SPF authentication.
   - `CNAME` for DKIM cryptographic verification.
   - `MX` for delivery feedback and bounce handling.
4. Click **Verify DNS Records** in Resend.
5. Navigate to **API Keys** $\rightarrow$ **Create API Key** with Full Access.
6. Set in backend `.env`:
   ```bash
   RESEND_API_KEY="re_live_xxxxxxxxxxxxxxxx"
   EMAIL_FROM="DevVegis <orders@devvegis.com>"
   ```

### 3.4 Razorpay Live Mode
1. In your Razorpay Dashboard, complete KYC to activate **Live Mode**.
2. Go to **Settings** $\rightarrow$ **API Keys** $\rightarrow$ Generate Live Keys.
3. Save `Key ID` and `Key Secret` in production environment variables.

---

## 4. Step-by-Step Deployment Guide

### Option A: Modern PaaS (Vercel + Render/Railway)

#### 4.1 Deploying the Backend (Render / Railway)
1. **Link Repository**: Create a new Web Service linked to the GitHub repository.
2. **Root Directory**: Set to `server`.
3. **Build Command**:
   ```bash
   npm ci && npx prisma generate && npm run build
   ```
4. **Start Command**:
   ```bash
   npm start
   ```
5. **Environment Variables**: Add all variables from Section 2.1.
6. **Health Check Endpoint**: Set path to `/health` (responds with HTTP 200 `{ status: "ok" }`).

#### 4.2 Running Database Migrations
Before directing user traffic to the backend, run Prisma production migrations:
```bash
# In the server directory (or via one-off deploy command in CI/CD)
npx prisma migrate deploy
```
*Tip: If starting with fresh tables and you need initial vegetable and fruit stock, run:*
```bash
npm run seed  # or npx ts-node prisma/seed.ts
```

#### 4.3 Deploying the Frontend (Vercel)
1. In Vercel, click **Add New Project** and import the repository.
2. **Root Directory**: Set to `client`.
3. **Framework Preset**: Select **Next.js**.
4. **Build Command**: `npm run build` (Next.js will automatically optimize assets).
5. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com/api/v1`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: `rzp_live_xxxxxxxx`
6. Click **Deploy**. Assign your custom domain (e.g. `devvegis.com`).

---

### Option B: Self-Hosted Docker Compose Setup

For deployment on an Ubuntu VPS, AWS EC2, or DigitalOcean Droplet, use the production container stack below:

#### `docker-compose.prod.yml`
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=${DATABASE_URL}
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - EMAIL_FROM=${EMAIL_FROM}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_ENDPOINT_URL_S3=${AWS_ENDPOINT_URL_S3}
      - AWS_REGION=${AWS_REGION}
      - AWS_BUCKET_NAME=${AWS_BUCKET_NAME}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
    ports:
      - "5000:5000"

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

#### Production Backend `server/Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5000
CMD ["node", "dist/index.js"]
```

#### Production Frontend `client/Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 5. Security & Hardening Checklist for EM

Prior to launching public traffic, verify each item:

- [ ] **No Default Secrets**: Verify `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are randomly generated 64-character strings and not the default dev strings.
- [ ] **Strict CORS Policy**: `CORS_ORIGIN` contains only your explicit domains (e.g. `https://devvegis.com`), no wildcard `*`.
- [ ] **Rate Limiter Confirmation**: Confirm rate limiters are active:
  - Global API: 500 requests / 15 mins.
  - Auth Endpoints: 20 requests / 15 mins.
  - Checkout & Orders: 30 requests / 15 mins.
  - OTP Requests: 5 requests / 10 mins.
- [ ] **Trust Proxy**: Line `app.set('trust proxy', 1);` is enabled in `server/src/index.ts` so rate limiters inspect actual client IPs behind Cloudflare/Vercel/Nginx.
- [ ] **Delivery OTP Isolation**: Verify that `server/src/modules/riders/riders.controller.ts` sanitizes and strips `deliveryOtp` before sending data to riders.
- [ ] **SSL/TLS Enforcement**: All HTTP traffic redirected to HTTPS with HSTS enabled.

---

## 6. Post-Deployment Verification Runbook (Smoke Tests)

Execute this 5-minute sanity check immediately after production rollout:

### Test 1: API Health Check
```bash
curl -i https://api.yourdomain.com/health
# Expected: HTTP 200 OK {"status":"ok","service":"DevVegis API",...}
```

### Test 2: Customer Signup & Authentication
1. Open `https://yourdomain.com/register`.
2. Register a new customer account.
3. Verify JWT cookie / token is received and user profile loads.

### Test 3: Produce Catalog & Cart
1. Navigate to `/` and search for *"Tomato"* or *"Spinach"*.
2. Add produce to cart. Ensure cart count updates in navbar badge.
3. Open cart sheet and click **Proceed to Checkout**.

### Test 4: End-to-End Order & Resend OTP Email
1. Complete checkout with **Cash on Delivery (COD)**.
2. Verify redirect to `/orders/[id]`.
3. Check customer inbox: Verify that **Resend** sent the delivery OTP email with the 4-digit code.
4. Verify that the customer order tracking page displays the same 4-digit OTP.

### Test 5: Rider Delivery Handshake
1. Open `https://yourdomain.com/rider` on mobile or in an incognito window.
2. Confirm that the new order appears in the Rider feed with price and delivery address.
3. **Verify Security**: Ensure the OTP is **NOT** visible on the rider interface.
4. Click **Confirm Picked**.
5. Enter the customer's 4-digit OTP and click **Deliver**.
6. Verify delivery confirmation and ₹50 credit update in the rider shift tally.

---

## 7. Disaster Recovery & Rollback Procedures

### Instant Rollback
* **Vercel (Frontend)**: Go to **Deployments** $\rightarrow$ Find previous working deployment $\rightarrow$ Click **Promote to Production** (instant, 0-second downtime).
* **Backend (Render / Railway / Container)**: Roll back to previous Git commit SHA or Docker image tag.

### Database Backup & Restore on Neon
* Neon provides **Point-in-Time Restore (PITR)** up to 30 days.
* To recover from an accidental data corruption or faulty migration:
  1. Open the Neon Console $\rightarrow$ **Branches**.
  2. Click **Restore branch to a point in time**.
  3. Select the timestamp prior to the incident and redirect the pooled `DATABASE_URL` to the restored branch.
