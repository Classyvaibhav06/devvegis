import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DevVegis — Fresh Fruits & Vegetables Delivered in Minutes",
    template: "%s | DevVegis",
  },
  description:
    "Order fresh fruits, vegetables, herbs, and organic produce online. Lightning-fast delivery from farm to doorstep. DevVegis — India's premium grocery delivery platform.",
  keywords: ["grocery delivery", "fresh vegetables", "fruits online", "organic vegetables", "quick commerce", "devvegis"],
  authors: [{ name: "DevVegis" }],
  creator: "DevVegis",
  metadataBase: new URL("https://devvegis.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://devvegis.com",
    title: "DevVegis — Fresh Fruits & Vegetables Delivered in Minutes",
    description: "Order fresh fruits & vegetables online. Quick delivery from farm to doorstep.",
    siteName: "DevVegis",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevVegis — Fresh Grocery Delivery",
    description: "Order fresh fruits & vegetables. Quick delivery.",
    creator: "@devvegis",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `
  try {
    const saved = localStorage.getItem('devvegis_theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  } catch (e) {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#F8FAFC] dark:bg-[#080C14] text-[#0F172A] dark:text-[#E8EEF8] transition-colors duration-200`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
