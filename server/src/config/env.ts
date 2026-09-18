import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  
  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'devvegis_access_secret_dev_2024',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'devvegis_refresh_secret_dev_2024',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'razorpay_secret_placeholder',
  
  // Email & Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'DevVegis <onboarding@resend.dev>',
  
  // App
  APP_URL: (process.env.APP_URL || 'http://localhost:3000').replace(/^.*APP_URL=/, '').replace(/\/$/, ''),
  API_URL: (process.env.API_URL || (process.env.RENDER_EXTERNAL_URL ? process.env.RENDER_EXTERNAL_URL : 'http://localhost:5000')).replace(/^.*API_URL=/, '').replace(/\/$/, ''),
  
  // Storage & Neon S3 Object Storage
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_ENDPOINT_URL_S3: process.env.AWS_ENDPOINT_URL_S3 || '',
  AWS_REGION: process.env.AWS_REGION || 'us-east-2',
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'uploads',
  
  // Delivery
  DELIVERY_FEE: parseFloat(process.env.DELIVERY_FEE || '25'),
  FREE_DELIVERY_ABOVE: parseFloat(process.env.FREE_DELIVERY_ABOVE || '199'),
  GST_RATE: parseFloat(process.env.GST_RATE || '0.05'), // 5% GST

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',

  // Cloudflare Turnstile
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY || '0x4AAAAAAE8RCUNEXvz4suaK2mFj6g4TYW0',
};
