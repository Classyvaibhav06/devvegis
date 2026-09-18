import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: true,
  preview: {
    buckets: {
      uploads: { access: "public_read" },
    },
    functions: {
      api: {
        name: "devvegis api",
        source: "server/dist-function",
        env: {
          NODE_ENV: "production",
          JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "devvegis_jwt_access_secret_change_in_production",
          JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "devvegis_jwt_refresh_secret_change_in_production",
          CORS_ORIGIN: "https://devvegis-client.vercel.app,http://localhost:3000",
          RESEND_API_KEY: process.env.RESEND_API_KEY || "",
          EMAIL_FROM: process.env.EMAIL_FROM || "DevVegis <onboarding@resend.dev>",
        },
      },
    },
  },
});
