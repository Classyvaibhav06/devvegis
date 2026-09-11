# Design System: DevVegis Fresh & Pure

## 1. Visual Theme & Atmosphere
A luminous, editorial, ultra-premium light-theme quick commerce interface for fresh farm-to-table fruits, vegetables, and gourmet produce. The atmosphere is vibrant, organic, crisp, and pristine — reminiscent of a sunlight-drenched high-end organic grocer (Erewhon / Whole Foods meets Blinkit's 10-minute speed). Clean white surfaces, subtle frosted glass cards, razor-thin borders, and juicy accents in fresh lime (#65A30D / #84CC16) and tangy sun-warmed citrus (#F97316).

## 2. Color Palette & Roles
- **Pristine Canvas** (#FFFFFF) — Primary background surface, ultra-clean and luminous
- **Light Cream Surface** (#F8FAFC) — Secondary background, page section alternating fill
- **Card Surface** (#FFFFFF) — High-elevation card container with diffused ambient shadow
- **Charcoal Ink** (#0F172A) — Primary typography, crisp and high-contrast
- **Muted Slate** (#64748B) — Secondary body copy, weight tags, descriptions, metadata
- **Soft Border** (#E2E8F0) — 1px structural boundaries, subtle dividers
- **Lime Leaf Accent** (#65A30D) — Primary action buttons, discount percentages, fresh tags, active indicators
- **Lime Glow** (#84CC16) — Hover states, gradient accents
- **Tangy Citrus** (#F97316) — Flash sale ribbons, promotional banners, savings callouts
- **Golden Honey** (#F59E0B) — Star ratings, organic badges

## 3. Typography Rules
- **Display & Headlines:** Outfit / Poppins / Inter — Track-tight (-0.03em), confident weights (600/700/800), clean optical balance
- **Body:** Inter / System UI — Clean 400/500 weights, relaxed leading (1.5), max 65ch per line
- **Product Weights & Numeric Prices:** Tabular numerals with bold price currency, uppercase monospace weight tags (e.g., 500G, 1KG, 6 PCS)
- **Hierarchy:** High contrast achieved through font-weight and subtle color differences, never through oversized chaotic text

## 4. Component Stylings
- **Header:** Sticky top navigation, ultra-clean pure white with subtle 1px border-bottom. High-visibility switch between 🛒 Retail (10-15 Min) and 🏪 Wholesale (B2B Bulk). Integrated quick search with pill shape.
- **Product Cards:** Generously rounded corners (20px), soft diffused elevation shadow (`0 4px 20px -2px rgba(0, 0, 0, 0.05)`), crisp white background, high-resolution square produce photography with subtle zoom on hover. Prominently displays exact grams/pieces badge, strikethrough MRP, instant "Add" button that expands into tactile +/- stepper with smooth spring motion.
- **Category Pills & Grid:** Rounded circular or squircle icons with soft tinted pastel backgrounds (e.g. pale lime, pale orange, pale emerald) and bold category labels.
- **Buttons:** Tactile push micro-animations (-1px translate on active). Primary button uses rich Lime Leaf gradient with white text and soft colored shadow.
- **Banners:** Asymmetric split cards with organic curvilinear motifs, fresh photography, and clear CTA buttons.
- **Badges:** Pill-shaped tags with light tinted backgrounds and bold text (e.g. `bg-lime-50 text-lime-700`, `bg-orange-50 text-orange-700`).

## 5. Layout Principles
- Maximum width 1280px, centered with generous 24px/32px horizontal padding.
- Clean vertical breathing room (40px - 64px section spacing).
- Multi-column responsive grid with single-column collapse on mobile viewports.
- Pure light theme with intentional whitespace, zero dark clutter.

## 6. Motion & Interaction
- Spring physics (`stiffness: 120, damping: 18`) on cart additions, quantity steppers, and modal reveals.
- Smooth image hover scale (`scale(1.05)` with `cubic-bezier(0.16, 1, 0.3, 1)`).
- Instant responsive feedback on tap and hover.
