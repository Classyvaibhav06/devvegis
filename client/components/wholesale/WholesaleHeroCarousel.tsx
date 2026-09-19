'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, ShoppingCart, ArrowRight,
  ShieldCheck, Sparkles, Truck, Clock, CheckCircle2, Heart
} from 'lucide-react';

interface WholesaleSlide {
  id: string;
  badge: string;
  tagline: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  ctaText: string;
  ctaAction: string;
  themeGradient: string;
  textColor: string;
  accentColor: string;
  image: string;
  alt: string;
  priceTag?: string;
  highlights: string[];
}

const WHOLESALE_SLIDES: WholesaleSlide[] = [
  {
    id: 'most-loved',
    badge: 'MANDI DIRECT BESTSELLERS',
    tagline: 'Loved by Thousands. Chosen for Quality.',
    title: 'MOST LOVED',
    titleHighlight: 'PRODUCTS',
    subtitle: 'Direct APMC Mandi open auction rates on high-volume produce crates. Cleaned, graded, and delivered at 4:30 AM.',
    ctaText: 'SHOP NOW',
    ctaAction: '#wholesale-catalog',
    themeGradient: 'from-[#FDF3E7] via-[#FFF8F0] to-[#FDE8D3] dark:from-[#1A1510] dark:via-[#13110E] dark:to-[#0F0D0A]',
    textColor: 'text-slate-900 dark:text-white',
    accentColor: 'text-[#D92D20] dark:text-[#F97066]',
    image: '/wholesale-hero.jpg',
    alt: 'Most loved wholesale produce crates, tomatoes, onions, greens',
    priceTag: 'Crates Starting @ ₹18/kg',
    highlights: ['Zero Mandi Brokerage', 'Weight & Quality Certified', 'Same-Day Dock Dispatch'],
  },
  {
    id: 'cold-chain',
    badge: '04:30 AM REEFER FLEET',
    tagline: 'Farm to Kitchen Dock at Controlled 4°C.',
    title: 'DAWN HARVEST',
    titleHighlight: 'COLD-CHAIN',
    subtitle: 'Pre-cooled refrigerated transport guaranteeing crisp freshness with our Zero Spoilage SLA replacement warranty.',
    ctaText: 'EXPLORE SLOTS',
    ctaAction: '#wholesale-catalog',
    themeGradient: 'from-[#EAF8F1] via-[#F2FAF5] to-[#DDF3E8] dark:from-[#091712] dark:via-[#07130F] dark:to-[#050E0B]',
    textColor: 'text-slate-900 dark:text-white',
    accentColor: 'text-[#10B981] dark:text-[#34D399]',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=650&q=85&fit=crop',
    alt: 'Cold chain produce delivery for commercial kitchens',
    priceTag: '0% Spoilage Guarantee',
    highlights: ['GPS Tracked Reefer Trucks', 'Temperature Logged', 'Kitchen Dock Staging'],
  },
  {
    id: 'exotics-gourmet',
    badge: 'HO.RE.CA SPECIALTY LINE',
    tagline: 'Artisanal Produce for Fine Dining & Gourmet Kitchens.',
    title: 'EXOTIC & GOURMET',
    titleHighlight: 'HARVESTS',
    subtitle: 'Hass Avocados, Romanesco, Bell Peppers, Cherry Tomatoes & Washed Iceberg Greens graded for executive chefs.',
    ctaText: 'VIEW EXOTICS',
    ctaAction: '#wholesale-catalog',
    themeGradient: 'from-[#F7EEFA] via-[#FCF5FD] to-[#F1E0F5] dark:from-[#160E1A] dark:via-[#110B14] dark:to-[#0D080F]',
    textColor: 'text-slate-900 dark:text-white',
    accentColor: 'text-[#9333EA] dark:text-[#C084FC]',
    image: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=1200&h=650&q=85&fit=crop',
    alt: 'Gourmet exotic vegetables and culinary herbs',
    priceTag: 'Chef Graded Selection',
    highlights: ['Microgreens Available', 'Hydroponic Zero-Soil', 'Daily Uniform Sizing'],
  },
  {
    id: 'contract-farming',
    badge: 'INSTITUTIONAL PRICE LOCK',
    tagline: 'Hedge Mandi Price Volatility with 30-Day Contracts.',
    title: 'MONTHLY FIXED',
    titleHighlight: 'RATE CONTRACTS',
    subtitle: 'Lock in predictable procurement pricing with formal GST tax invoices, GSTR-2B reconciliation & Net-15/30 credit lines.',
    ctaText: 'REQUEST RFQ',
    ctaAction: 'rfq-modal',
    themeGradient: 'from-[#EDF2FA] via-[#F4F7FC] to-[#E1EAF7] dark:from-[#0B121E] dark:via-[#090E17] dark:to-[#070B12]',
    textColor: 'text-slate-900 dark:text-white',
    accentColor: 'text-[#2563EB] dark:text-[#60A5FA]',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200&h=650&q=85&fit=crop',
    alt: 'B2B contract farming and transparent procurement',
    priceTag: 'Net-15 / Net-30 Credit',
    highlights: ['Full GST Tax Invoices', 'Dedicated Account Officer', 'Customized Delivery Window'],
  },
];

export default function WholesaleHeroCarousel({
  onOpenRFQ,
}: {
  onOpenRFQ?: () => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % WHOLESALE_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + WHOLESALE_SLIDES.length) % WHOLESALE_SLIDES.length);
  };

  // Autoplay timer: advance every 5.5 seconds unless paused on hover
  useEffect(() => {
    if (isHovered) return;
    timerRef.current = setInterval(nextSlide, 5500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, currentSlide]);

  const slide = WHOLESALE_SLIDES[currentSlide];

  const handleCtaClick = (action: string) => {
    if (action === 'rfq-modal') {
      if (onOpenRFQ) onOpenRFQ();
    } else if (action.startsWith('#')) {
      const el = document.querySelector(action);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-5 sm:my-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative rounded-[4px] overflow-hidden border border-slate-200 dark:border-white/[0.08] shadow-md group">
        {/* ─── Slide Content Container ─── */}
        <div className={`relative min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] bg-gradient-to-r ${slide.themeGradient} transition-colors duration-500 flex items-center`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12 relative z-10"
            >
              {/* Left Column: Bold Typography & Action */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
                {/* Decorative playful icon & badge */}
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-white/80 dark:bg-black/40 backdrop-blur-xs text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border border-black/10 dark:border-white/10 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>{slide.badge}</span>
                  </span>
                  {slide.priceTag && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-[2px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] sm:text-xs border border-emerald-500/30">
                      {slide.priceTag}
                    </span>
                  )}
                </div>

                {/* Big Headline */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500 inline-block animate-bounce" />
                    <span className="font-heading font-black text-xs sm:text-sm text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                      DevVegis Mandi Floor Exclusive
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-black tracking-tight leading-[1.08]">
                    <span className={slide.textColor}>{slide.title} </span>
                    <span className={`${slide.accentColor} drop-shadow-xs`}>
                      {slide.titleHighlight}
                    </span>
                  </h1>
                  <p className="font-serif italic text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
                    {slide.tagline}
                  </p>
                </div>

                {/* Subtitle Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  {slide.subtitle}
                </p>

                {/* Trust Highlights Checklist */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {slide.highlights.map((h, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{h}</span>
                    </span>
                  ))}
                </div>

                {/* Prominent Red / Emerald CTA Button matching reference image */}
                <div className="pt-2 flex items-center justify-center lg:justify-start gap-4">
                  <button
                    onClick={() => handleCtaClick(slide.ctaAction)}
                    className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 bg-[#D92D20] hover:bg-[#B42318] text-white font-heading font-black text-sm sm:text-base rounded-full shadow-lg hover:shadow-red-500/25 transition-all duration-200 cursor-pointer active:scale-[0.98] group/btn"
                  >
                    <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  {onOpenRFQ && (
                    <button
                      onClick={onOpenRFQ}
                      className="hidden sm:inline-flex items-center gap-2 px-6 py-3.5 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-white font-heading font-bold text-xs sm:text-sm rounded-[2px] transition-all cursor-pointer"
                    >
                      <span>Custom Mandi RFQ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: High Quality Produce Stage Display */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="relative w-full max-w-[420px] lg:max-w-none aspect-[4/3] rounded-[4px] overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl bg-white dark:bg-[#131923]">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* Floating quality watermark badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-bold bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-[2px] border border-white/10">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cold Chain Dock Dispatch</span>
                    </span>
                    <span className="font-mono text-emerald-300">04:30 AM IST</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── Left & Right Chevron Controls ─── */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-[2px] bg-white/90 dark:bg-black/70 hover:bg-white dark:hover:bg-black border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg cursor-pointer z-20 hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-[2px] bg-white/90 dark:bg-black/70 hover:bg-white dark:hover:bg-black border border-slate-200 dark:border-white/15 text-slate-800 dark:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg cursor-pointer z-20 hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* ─── Bottom Dots Navigation ─── */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
          {WHOLESALE_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-200 rounded-full cursor-pointer ${
                idx === currentSlide
                  ? 'w-6 h-2 bg-[#D92D20] dark:bg-red-500'
                  : 'w-2 h-2 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
