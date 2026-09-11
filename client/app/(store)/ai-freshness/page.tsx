'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Scan, Upload, ShieldCheck, Thermometer, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

const SAMPLE_PRODUCE = [
  {
    name: 'Hydroponic Cherry Tomatoes',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
    freshness: 98,
    shelfLife: '6-8 days',
    storage: 'Store at 12°C - 15°C away from direct sunlight. Do not freeze.',
    ripeness: 'Peak Ripeness (Optimal Lycopene)',
    vitamins: 'High Vitamin C (19mg/100g) & Potassium',
  },
  {
    name: 'Organic English Spinach',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80',
    freshness: 94,
    shelfLife: '4-5 days',
    storage: 'Wrap in breathable paper towel in crisper drawer at 4°C.',
    ripeness: 'Crisp & Vibrant Green',
    vitamins: 'High Iron (2.7mg/100g) & Folate',
  },
  {
    name: 'Hass Avocado',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80',
    freshness: 91,
    shelfLife: '3-4 days',
    storage: 'Keep at room temperature until slight yield to pressure, then chill.',
    ripeness: 'Ready to Eat (Creamy Texture)',
    vitamins: 'Omega-9 Monounsaturated Fats & Vitamin E',
  },
];

export default function AiFreshnessPage() {
  const [selectedProduce, setSelectedProduce] = useState(SAMPLE_PRODUCE[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<typeof SAMPLE_PRODUCE[0] | null>(SAMPLE_PRODUCE[0]);

  const handleScan = (produce: typeof SAMPLE_PRODUCE[0]) => {
    setSelectedProduce(produce);
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanResult(produce);
      toast.success('Freshness scan complete!');
    }, 1200);
  };

  return (
    <div className="container-main py-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-700 to-green-700 text-white p-8 md:p-12 mb-8 shadow-green">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-4">
            <Scan className="w-3.5 h-3.5" />
            <span>DevVegis Quality AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold mb-3">
            AI Produce Freshness Inspector
          </h1>
          <p className="text-green-100 text-sm sm:text-base leading-relaxed">
            Every fruit and vegetable delivered by DevVegis undergoes computer vision quality grading to guarantee farm-fresh quality and zero spoiled items.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Scan target / Image selector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6">
            <h2 className="text-base font-heading font-bold text-gray-900 dark:text-gray-100 mb-2">
              Select Produce to Inspect
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Choose from sample harvest photos or trigger an instant AI scan.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {SAMPLE_PRODUCE.map((p) => {
                const isSelected = selectedProduce.name === p.name;
                return (
                  <button
                    key={p.name}
                    onClick={() => handleScan(p)}
                    className={`rounded-2xl overflow-hidden border-2 text-left transition-all ${
                      isSelected
                        ? 'border-green-500 ring-2 ring-green-500/30 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="relative aspect-square">
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800">
                      <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">
                        {p.name}
                      </p>
                      <span className="text-[10px] text-green-600 font-semibold">
                        {p.freshness}% Fresh
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Scanner viewfinder */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black flex items-center justify-center">
              <Image
                src={selectedProduce.image}
                alt="Inspection"
                fill
                className="object-cover opacity-90"
              />

              {/* Laser scan animation */}
              {isScanning && (
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 shadow-[0_0_15px_#22c55e]"
                />
              )}

              <div className="absolute inset-0 border-2 border-green-500/40 rounded-2xl pointer-events-none" />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-green-400 font-mono">
                CAMERA // 4K OPTICAL
              </div>
            </div>

            <button
              onClick={() => handleScan(selectedProduce)}
              disabled={isScanning}
              className="btn-primary w-full mt-4 py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4" />
              <span>{isScanning ? 'Analyzing Produce Cells...' : 'Re-scan Current Item'}</span>
            </button>
          </div>
        </div>

        {/* Right: Scan Results */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {scanResult && !isScanning && (
              <motion.div
                key={scanResult.name}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-6 md:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="badge-green mb-1.5 inline-block">AI Verified Fresh</span>
                    <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
                      {scanResult.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Batch #DV-2026-FARM-KOLAR
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/40 px-4 py-3 rounded-2xl border border-green-100 dark:border-green-800/40">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                    <div>
                      <span className="text-[10px] text-green-700 dark:text-green-400 uppercase font-bold block">
                        Freshness Score
                      </span>
                      <span className="text-2xl font-heading font-extrabold text-green-600">
                        {scanResult.freshness}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid of details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      <span>Estimated Shelf Life</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {scanResult.shelfLife}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Under recommended temperature guidelines.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Ripeness Stage</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {scanResult.ripeness}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Crisp cell wall integrity confirmed.
                    </p>
                  </div>
                </div>

                {/* Storage Recommendations */}
                <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                    <Thermometer className="w-4 h-4 text-amber-600" />
                    <span>Recommended Storage Protocol</span>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                    {scanResult.storage}
                  </p>
                </div>

                {/* Nutrition */}
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">
                    Nutritional Highlight
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {scanResult.vitamins}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
