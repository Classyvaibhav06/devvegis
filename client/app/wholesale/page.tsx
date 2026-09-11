'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Truck, ShieldCheck, Download, ShoppingCart,
  Percent, FileSpreadsheet, Check, ArrowRight, PhoneCall, Plus, Minus
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

const BULK_ITEMS = [
  {
    id: 'w1',
    name: 'Grade-A Farm Red Onions (Nashik)',
    crateSize: '50 Kg Gunny Bag',
    retailPrice: 42,
    wholesalePrice: 28,
    minQty: 2,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'w2',
    name: 'Fresh Potato Jyoti (Cold Storage)',
    crateSize: '50 Kg Bag',
    retailPrice: 38,
    wholesalePrice: 24,
    minQty: 2,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'w3',
    name: 'Firm Hydroponic Hybrid Tomatoes',
    crateSize: '25 Kg Plastic Crate',
    retailPrice: 48,
    wholesalePrice: 31,
    minQty: 4,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'w4',
    name: 'Green Cabbage Export Quality',
    crateSize: '30 Kg Mesh Bag',
    retailPrice: 32,
    wholesalePrice: 19,
    minQty: 3,
    image: 'https://images.unsplash.com/photo-1550950158-d0d960dff51b?w=500&auto=format&fit=crop&q=80',
  },
];

export default function WholesalePage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    w1: 2,
    w2: 2,
    w3: 4,
    w4: 0,
  });

  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [registered, setRegistered] = useState(false);

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const calculateTotal = () => {
    return BULK_ITEMS.reduce((sum, item) => {
      const qty = quantities[item.id] || 0;
      // parse kg from crateSize e.g. 50
      const kgPerCrate = parseInt(item.crateSize) || 25;
      return sum + qty * kgPerCrate * item.wholesalePrice;
    }, 0);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !gstin) {
      toast.error('Please fill business details');
      return;
    }
    setRegistered(true);
    toast.success('B2B Wholesale Account Activated!');
  };

  const totalAmount = calculateTotal();

  return (
    <div className="container-main py-8 space-y-8">
      {/* B2B Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-green-800 to-teal-900 text-white p-8 md:p-12 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Direct Farm Sourcing for HoReCa & Retailers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold mb-4 leading-tight">
            DevVegis Wholesale Produce Hub
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed mb-6">
            Source fresh vegetables and fruits in bulk crates at wholesale Mandi rates. Daily scheduled morning delivery before 6 AM, automated GST tax invoices, and 15-day credit terms.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-emerald-200">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <Truck className="w-4 h-4 text-green-400" />
              Before 6 AM Delivery
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <FileSpreadsheet className="w-4 h-4 text-green-400" />
              Input Tax Credit (GST)
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <Percent className="w-4 h-4 text-green-400" />
              Up to 35% Lower than Retail
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Registration / Account info & Bulk Price Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Bulk Product List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-gray-100">
                Daily Mandi Bulk Crate Rates
              </h2>
              <p className="text-xs text-gray-500">
                Prices updated today at 04:00 AM based on primary harvest arrivals
              </p>
            </div>
            <button
              onClick={() => toast.success('Daily Wholesale Rate Sheet Downloaded (PDF)')}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Rate Sheet</span>
            </button>
          </div>

          <div className="space-y-4">
            {BULK_ITEMS.map((item) => {
              const qty = quantities[item.id] || 0;
              const kgPerCrate = parseInt(item.crateSize) || 25;
              const subtotal = qty * kgPerCrate * item.wholesalePrice;
              const savings = (item.retailPrice - item.wholesalePrice) * kgPerCrate * qty;

              return (
                <div
                  key={item.id}
                  className="card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-heading font-bold text-gray-900 dark:text-gray-100">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Packaging: <strong className="text-gray-700 dark:text-gray-300">{item.crateSize}</strong> (Min {item.minQty} crates)
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-base font-extrabold text-green-600">
                          ₹{item.wholesalePrice} / Kg
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{item.retailPrice} / Kg
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                          Save ₹{item.retailPrice - item.wholesalePrice}/Kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Subtotal */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-900 dark:text-gray-100">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </p>
                      {savings > 0 && (
                        <p className="text-[10px] text-green-600 font-semibold">
                          You save ₹{savings.toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order Summary & Verification */}
        <div className="lg:col-span-4 space-y-6">
          {/* B2B Onboarding / GST Card */}
          <div className="card p-6">
            <h3 className="text-base font-heading font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-600" />
              <span>Business Account Details</span>
            </h3>

            {!registered ? (
              <form onSubmit={handleRegister} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    Restaurant / Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Olive Kitchens Pvt Ltd"
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    required
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="29AAAAA0000A1Z5"
                    className="input text-xs uppercase"
                  />
                </div>
                <button type="submit" className="btn-primary w-full text-xs py-2.5">
                  Verify & Activate Wholesale Rates
                </button>
              </form>
            ) : (
              <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-green-700 dark:text-green-300 font-bold">
                  <Check className="w-4 h-4" />
                  <span>GSTIN Verified: {gstin}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Business: <strong>{businessName}</strong>
                </p>
                <span className="inline-block text-[10px] text-green-600 font-semibold uppercase">
                  ✓ Eligible for 5% B2B Input Tax Credit
                </span>
              </div>
            )}
          </div>

          {/* Bulk Invoice Summary */}
          <div className="card p-6">
            <h3 className="text-base font-heading font-bold text-gray-900 dark:text-gray-100 mb-4">
              Bulk Order Quotation
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Total Weight</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {BULK_ITEMS.reduce((acc, item) => acc + (quantities[item.id] || 0) * (parseInt(item.crateSize) || 25), 0)} Kg
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal (Wholesale)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Logistics / Crate Handling</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>GST (0% Fresh Veg / 5% Packed)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">₹0</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between text-base font-bold text-gray-900 dark:text-gray-100">
                <span>Total Quotation</span>
                <span className="text-green-600">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (totalAmount === 0) {
                  toast.error('Please add at least 1 bulk crate');
                  return;
                }
                toast.success('B2B Wholesale Purchase Order submitted! Our procurement team will contact you.');
              }}
              className="btn-primary w-full mt-6 py-3 text-xs flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Submit Purchase Order (PO)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
