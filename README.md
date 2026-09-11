# DevVegis 🥦 — Blinkit-Level Grocery & Fresh Produce Delivery Platform

> **"Farm to Doorstep in 10-15 Minutes"**  
> Premium quick-commerce application crafted with Next.js 15, TypeScript, Tailwind CSS, Node.js/Express, PostgreSQL, and Prisma ORM.

---

## 🚀 Key Modules & Experience

1. **Consumer Quick Commerce Store (`/`)**
   - **Hero Carousel & Trust Badges**: Visual storytelling, instant dispatch counter, organic certifications.
   - **Category Browser (`/categories/[slug]`)**: Fresh Veggies, Exotic Greens, Seasonal Fruits, Hydroponics, Herbs, and Dry Fruits.
   - **Real-Time Search (`/search`)**: Debounced query engine, voice search simulation, instant filters, trending searches.
   - **Product Detail (`/products/[slug]`)**: Multi-angle image gallery, shelf-life indicators, nutritional breakdown, bulk savings, and animated cart addition.
   - **Cart & Slide-over (`/cart`)**: Real-time quantity controls, free delivery threshold progress bar (Free above ₹199), coupon application.
   - **Multi-Step Checkout (`/checkout`)**: Saved addresses, delivery speed selection (⚡ Instant 10-15 min, Evening, Morning), Razorpay & DevVegis Wallet payment, live tip.
   - **Order Tracking (`/orders/[id]`)**: Live delivery status progression (Confirmed → Packing → Out for Delivery → Delivered), simulated GPS route map, 4-digit rider OTP.
   - **User Hub (`/profile`)**: Address book, wallet balance & cashbacks, active coupons, and unique "Refer & Earn ₹100" program.

2. **AI Smart Features**
   - **AI Recipe Generator (`/ai-recipe`)**: Turn items in your cart or fridge into healthy gourmet recipes with nutrition details and 1-click grocery ordering for missing ingredients.
   - **AI Freshness Scanner (`/ai-freshness`)**: Computer vision simulation analyzing ripeness percentages, cellular crispness, and cold-storage instructions.

3. **B2B Wholesale Produce Hub (`/wholesale`)**
   - Direct farm sourcing for restaurants, cafes, hotels, and retail groceries.
   - Volume crate pricing (25kg - 50kg crates) up to 35% below retail rates.
   - Instant GSTIN verification and automated B2B tax invoice quotations.

4. **Rider Quick-Commerce Portal (`/rider`)**
   - Mobile-first dashboard for darkstore delivery heroes.
   - Shift online/offline toggle, active delivery queue with turn-by-turn map links.
   - 4-digit customer delivery OTP verification and live daily earnings tracker.

5. **Admin Operations Center (`/admin`)**
   - **Overview Dashboard (`/admin`)**: Daily revenue, order volume, average delivery time, live charts (Recharts).
   - **Product Catalog (`/admin/products`)**: Full CRUD inventory, pricing, MRP discount ribbons, and organic tags.
   - **Order Dispatch (`/admin/orders`)**: Order status management with live stage transitions.
   - **Darkstore Inventory (`/admin/inventory`)**: Critical low-stock alerts and instant +50/+100 restock buttons.
   - **Marketing & Coupons (`/admin/coupons`)**: Campaign codes, flat and percentage discounts, min order limits.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Sonner toasts, Zustand state management, TanStack React Query.
- **Backend**: Node.js, Express.js (TypeScript), Prisma ORM, PostgreSQL, Redis (caching architecture), Helmet, CORS, Winston logger.
- **Security & Auth**: JWT (Access + Refresh tokens), bcryptjs password hashing, role-based access control (`CUSTOMER`, `WHOLESALE_BUYER`, `RIDER`, `ADMIN`).
- **Payment & Invoicing**: Razorpay sandbox integration, automated GST tax calculation, DevVegis Wallet.

---

## 📦 Project Directory Layout

```
devvegis/
├── client/                     # Next.js 15 Frontend
│   ├── app/
│   │   ├── (store)/            # Customer facing routes
│   │   │   ├── page.tsx        # Homepage (Hero, Categories, Products, AI recs)
│   │   │   ├── cart/           # Shopping cart
│   │   │   ├── checkout/       # Multi-step checkout & payment
│   │   │   ├── orders/         # Order history & live GPS tracking
│   │   │   ├── profile/        # Account, addresses, wallet, coupons
│   │   │   ├── wishlist/       # Saved produce items
│   │   │   ├── ai-recipe/      # AI Smart recipe generator
│   │   │   └── ai-freshness/   # AI Produce quality inspector
│   │   ├── wholesale/          # B2B Wholesale produce hub
│   │   ├── rider/              # Delivery partner fleet portal
│   │   ├── admin/              # Store manager dashboard & inventory
│   │   └── (auth)/             # Login & Registration
│   ├── components/             # Reusable UI components
│   └── store/                  # Zustand stores (cartStore, authStore)
│
├── server/                     # Express REST API (TypeScript)
│   ├── src/
│   │   ├── modules/            # Domain modules (auth, products, orders, etc.)
│   │   ├── middleware/         # Auth, RBAC, error handling, file uploads
│   │   ├── config/             # Prisma client, env, swagger
│   │   └── utils/              # Logger, emailer
│   └── package.json
│
├── prisma/                     # Database ORM
│   ├── schema.prisma           # 22+ database tables
│   └── seed.ts                 # 260+ initial products seed script
│
├── docker-compose.yml          # PostgreSQL 16 + Redis 7
├── .env.example                # Environment variables template
└── package.json                # Monorepo scripts
```

---

## ⚡ Quick Start Instructions

### 1. Prerequisites
- Node.js >= 18.x
- Docker & Docker Compose (for local PostgreSQL & Redis)

### 2. Start PostgreSQL & Redis
```bash
docker-compose up -d
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
cp .env.example server/.env
cp .env.example client/.env.local
```

### 4. Install Dependencies & Generate Prisma Client
```bash
npm install
npm run db:generate
```

### 5. Run Database Migration & Seed 260+ Products
```bash
npm run db:migrate
npm run db:seed
```

### 6. Start Development Servers (Frontend + Backend)
```bash
npm run dev
```

- **Customer Store**: [http://localhost:3000](http://localhost:3000)
- **Wholesale Portal**: [http://localhost:3000/wholesale](http://localhost:3000/wholesale)
- **Rider Portal**: [http://localhost:3000/rider](http://localhost:3000/rider)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Swagger Docs**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
