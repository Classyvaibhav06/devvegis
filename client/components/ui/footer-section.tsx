"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Leaf,
  Send,
  Sun,
  Moon,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Store,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/providers/themeProvider";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// High-fidelity SVG Social Icons for modern web
function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterXIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function Footerdemo() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme, isDark } = useTheme();
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (trimmed) {
      router.push(`/login?email=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/login');
    }
  };

  return (
    <footer className="relative border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/90 dark:bg-[#080C14] text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* ─── 1. Top Farm-to-Fork Value Props Strip ─────────────────── */}
      <div className="border-b border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-[#0E1420]/60 backdrop-blur-xs">
        <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  10-15 Min Express
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Direct from cold-chain dark stores
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  4:30 AM Farm Harvest
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hydroponic & certified organic
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Zero Pesticide Tested
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  AI verified freshness standard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  B2B Wholesale Mandi
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Bulk 25kg+ crates with GST ITC
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. Main Footer Grid ──────────────────────────────────── */}
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Newsletter Section (Span 2 cols on desktop) */}
          <div className="relative lg:col-span-2 pr-0 lg:pr-6">
            {/* Ambient decorative glow */}
            <div className="absolute -left-6 -top-6 h-36 w-36 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-emerald-500/30 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0 bg-white dark:bg-[#121927]">
                <Image
                  src="/logo.png"
                  alt="JK & DK Daily Fresh Mart - DevVegis"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline leading-none">
                  <span className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
                    Dev
                  </span>
                  <span className="font-heading font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 tracking-tight">
                    Vegis
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wide mt-1">
                  JK &amp; DK Daily Fresh Mart
                </span>
              </div>
            </Link>

            <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Farm-Fresh Greens, Delivered Fast.
            </h2>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              India&apos;s direct farm-to-door ecosystem. Crisp hydroponic produce, native fruits, and bulk mandi crates harvested at dawn and delivered in 10-15 minutes.
            </p>

            {/* Newsletter Subscription: Only show to guests who are not logged in */}
            {mounted && isAuthenticated ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>DevVegis Fresh Member • {user?.name || user?.email || 'Connected'}</span>
              </div>
            ) : (
              <div className="relative max-w-md">
                <form onSubmit={handleSubscribe} className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for harvest drops..."
                    className="pr-12 h-11 rounded-full border-slate-300 dark:border-white/15 bg-white dark:bg-[#121927] text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-emerald-500 shadow-xs"
                    required
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1.5 top-1.5 h-8 w-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-transform hover:scale-105 cursor-pointer"
                    aria-label="Subscribe to DevVegis newsletter"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span className="sr-only">Subscribe</span>
                  </Button>
                </form>
              </div>
            )}

            {/* Micro badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified 100% Residue-Free Produce</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Fresh Catalog
            </h3>
            <nav className="space-y-2.5 text-sm">
              <Link
                href="/categories/vegetables"
                className="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Daily Vegetables
              </Link>
              <Link
                href="/categories/fruits"
                className="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Orchard Fruits
              </Link>
              <Link
                href="/categories/organic"
                className="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                100% Organic & Hydroponics
              </Link>
              <Link
                href="/categories"
                className="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Exotic & Hydroponic Greens
              </Link>
              <Link
                href="/categories"
                className="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Fresh Herbs & Seasonings
              </Link>
              <Link
                href="/categories"
                className="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
              >
                View All Categories &rarr;
              </Link>
            </nav>
          </div>

          {/* B2B & Company Column */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              B2B Mandi & Trust
            </h3>
            <nav className="space-y-2.5 text-sm">
              <Link
                href="/wholesale"
                className="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                B2B Wholesale Mandi
              </Link>
              <Link
                href="/wholesale/categories"
                className="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                25kg+ Bulk Crates & Pallets
              </Link>
              <Link
                href="/about"
                className="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Our Direct Farmers Network
              </Link>
              <Link
                href="/quality"
                className="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Dawn Harvest Cold Chain
              </Link>
              <Link
                href="/orders"
                className="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Track Live Order
              </Link>
              <Link
                href="/refunds"
                className="block text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                100% Quality & Refund Guarantee
              </Link>
            </nav>
          </div>

          {/* Contact, Socials & Theme Toggle Column */}
          <div className="relative">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              DevVegis Care
            </h3>
            <address className="space-y-2.5 text-sm not-italic text-slate-600 dark:text-slate-400 mb-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <a href="tel:180033883447" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-slate-900 dark:text-white">
                  1800-DEV-VEGIS
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <a href="mailto:care@devvegis.com" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  care@devvegis.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Indiranagar Central Hub, Bengaluru 560038</span>
              </div>
            </address>

            {/* Social Icons */}
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Follow Our Farm Journey
            </h4>
            <div className="mb-6 flex flex-wrap gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://wa.me/9180033883447"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Chat with DevVegis on WhatsApp"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-8 w-8 hover:text-emerald-600 hover:border-emerald-500/40"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        <span className="sr-only">WhatsApp</span>
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>WhatsApp Support</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://instagram.com/devvegis"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Follow DevVegis on Instagram"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-8 w-8 hover:text-emerald-600 hover:border-emerald-500/40"
                      >
                        <InstagramIcon className="h-4 w-4" />
                        <span className="sr-only">Instagram</span>
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Instagram @devvegis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://x.com/devvegis"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Follow DevVegis on X"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-8 w-8 hover:text-emerald-600 hover:border-emerald-500/40"
                      >
                        <TwitterXIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">Twitter / X</span>
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Twitter / X @devvegis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://facebook.com/devvegis"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Follow DevVegis on Facebook"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-8 w-8 hover:text-emerald-600 hover:border-emerald-500/40"
                      >
                        <FacebookIcon className="h-4 w-4" />
                        <span className="sr-only">Facebook</span>
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Facebook / DevVegis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://linkedin.com/company/devvegis"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Connect with DevVegis on LinkedIn"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-8 w-8 hover:text-emerald-600 hover:border-emerald-500/40"
                      >
                        <LinkedinIcon className="h-4 w-4" />
                        <span className="sr-only">LinkedIn</span>
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>LinkedIn @devvegis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center space-x-3 pt-2 border-t border-slate-200 dark:border-white/10">
              <Sun className={`h-4 w-4 transition-colors ${!isDark ? 'text-amber-500' : 'text-slate-400'}`} />
              <Switch
                id="footer-dark-mode"
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
              <Moon className={`h-4 w-4 transition-colors ${isDark ? 'text-emerald-400' : 'text-slate-400'}`} />
              <Label htmlFor="footer-dark-mode" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                {isDark ? "Obsidian Dark" : "Dawn Light"}
              </Label>
            </div>
          </div>
        </div>

        {/* ─── 3. Sub-footer & Legal ──────────────────────────────── */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 dark:border-white/[0.08] pt-8 text-center md:flex-row text-xs text-slate-500 dark:text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} DevVegis Technologies Pvt. Ltd. All rights reserved.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/refunds" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Refund & Cancellation
            </Link>
            <Link href="/food-safety" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              FSSAI Food Safety Lic. #11224333000412
            </Link>
          </nav>
        </div>

        {/* ─── 4. Giant Watermark Typography (Signature 21st.dev Style) ─── */}
        <div className="w-full flex mt-6 items-center justify-center overflow-hidden pointer-events-none select-none">
          <h2 className="text-center text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] font-extrabold tracking-widest text-slate-200/50 dark:text-white/[0.03] transition-colors uppercase leading-none">
            DEVVEGIS
          </h2>
        </div>
      </div>
    </footer>
  );
}

export { Footerdemo as FooterSection };
export default Footerdemo;
