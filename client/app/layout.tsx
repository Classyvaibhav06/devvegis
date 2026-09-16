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
    "Order crisp vegetables, sweet fruits, hydroponic greens, and organic produce online in Bengaluru. Lightning-fast 12-minute delivery direct from farm to kitchen.",
  keywords: ["grocery delivery", "fresh vegetables", "fruits online", "organic vegetables", "quick commerce", "devvegis", "Bangalore grocery delivery"],
  authors: [{ name: "DevVegis Technologies Pvt. Ltd." }],
  creator: "DevVegis",
  metadataBase: new URL("https://devvegis.com"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://devvegis.com",
    title: "DevVegis — Fresh Fruits & Vegetables Delivered in Minutes",
    description: "Order fresh fruits & vegetables online in Bengaluru. 12-minute express delivery from farm to doorstep.",
    siteName: "DevVegis",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=630&q=85",
        width: 1200,
        height: 630,
        alt: "DevVegis Farm Fresh Produce Delivery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevVegis — Fresh Grocery Delivery",
    description: "Order fresh fruits & vegetables. Quick delivery in 12 minutes.",
    creator: "@devvegis",
    images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=630&q=85"],
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

const jsonLdData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DevVegis",
    "legalName": "DevVegis Technologies Pvt. Ltd.",
    "url": "https://devvegis.com",
    "logo": "https://devvegis.com/favicon.ico",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-1800-338-83447",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi", "Kannada"]
    },
    "sameAs": [
      "https://twitter.com/devvegis",
      "https://www.instagram.com/devvegis",
      "https://www.linkedin.com/company/devvegis"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    "name": "DevVegis Indiranagar Dark Store",
    "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    "@id": "https://devvegis.com/#store",
    "url": "https://devvegis.com",
    "telephone": "1800-338-83447",
    "priceRange": "₹₹",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "100ft Road, HAL 2nd Stage, Indiranagar",
      "addressLocality": "Bengaluru",
      "addressRegion": "Karnataka",
      "postalCode": "560038",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 12.9716,
      "longitude": 77.6412
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "05:00",
      "closes": "23:30"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DevVegis",
    "url": "https://devvegis.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://devvegis.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {jsonLdData.map((schema, idx) => (
          <script
            key={idx}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
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
