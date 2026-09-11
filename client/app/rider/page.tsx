'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bike, Navigation, Phone, CheckCircle2, AlertCircle,
  MapPin, Clock, DollarSign, Star, Power, ShieldCheck, KeyRound
} from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  distance: string;
  payout: number;
  itemsCount: number;
  status: 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED';
  expectedOtp: string;
}

const INITIAL_ORDERS: DeliveryOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'DV-9821',
    customerName: 'Priya Sharma',
    customerPhone: '+919876543210',
    address: 'Flat 402, Green Meadows, 5th Main, Indiranagar',
    distance: '1.2 km',
    payout: 45,
    itemsCount: 5,
    status: 'ASSIGNED',
    expectedOtp: '4829',
  },
  {
    id: 'ord-102',
    orderNumber: 'DV-9824',
    customerName: 'Rohan Mehra',
    customerPhone: '+919811223344',
    address: 'Villa 18, Palm Residency, 12th Cross, Domlur',
    distance: '2.4 km',
    payout: 60,
    itemsCount: 8,
    status: 'ASSIGNED',
    expectedOtp: '7190',
  },
];

export default function RiderPortalPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [orders, setOrders] = useState<DeliveryOrder[]>(INITIAL_ORDERS);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [completedCount, setCompletedCount] = useState(11);
  const [dailyEarnings, setDailyEarnings] = useState(640);

  const handlePickup = (id: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status: 'PICKED_UP' } : o))
    );
    toast.success('Produce verified & picked up from Dark Store! Head to customer.');
  };

  const handleVerifyOtp = (order: DeliveryOrder) => {
    const entered = otpInputs[order.id];
    if (entered !== order.expectedOtp) {
      toast.error('Invalid OTP! Please ask customer for correct 4-digit code.');
      return;
    }

    setOrders(prev => prev.filter(o => o.id !== order.id));
    setCompletedCount(prev => prev + 1);
    setDailyEarnings(prev => prev + order.payout);
    toast.success(`Order #${order.orderNumber} delivered! ₹${order.payout} credited.`);
  };

  return (
    <div className="space-y-4">
      {/* Online Status Toggle & Shift Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isOnline ? 'bg-green-500 animate-ping' : 'bg-rose-500'
            }`}
          />
          <div>
            <h2 className="text-sm font-bold text-white">
              {isOnline ? 'Active on Duty' : 'Offline / On Break'}
            </h2>
            <p className="text-[11px] text-slate-400">Hub: Indiranagar Darkstore #04</p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsOnline(!isOnline);
            toast.info(isOnline ? 'Shift ended. You are now offline.' : 'You are now online to receive delivery tasks!');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isOnline
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
              : 'bg-green-500 text-black hover:bg-green-400'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold mb-1">
            <DollarSign className="w-3.5 h-3.5 text-green-400" />
            <span>Earnings</span>
          </div>
          <p className="text-lg font-extrabold text-white">₹{dailyEarnings}</p>
          <p className="text-[10px] text-green-400 mt-0.5">Today + Tips</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold mb-1">
            <Bike className="w-3.5 h-3.5 text-blue-400" />
            <span>Delivered</span>
          </div>
          <p className="text-lg font-extrabold text-white">{completedCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Trips today</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold mb-1">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Rating</span>
          </div>
          <p className="text-lg font-extrabold text-white">4.92</p>
          <p className="text-[10px] text-amber-400 mt-0.5">Super Rider</p>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Delivery Queue ({orders.length})
          </h3>
          <span className="text-[11px] text-green-400 font-medium">⚡ 10-Min Target SLA</span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">All orders delivered!</h4>
            <p className="text-xs text-slate-400 mt-1">
              Stay in the Indiranagar radius. New incoming batch will buzz shortly.
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const isPickedUp = order.status === 'PICKED_UP';

            return (
              <motion.div
                key={order.id}
                layout
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {order.itemsCount} produce items
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-green-400">
                    +₹{order.payout} Payout
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-xs">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">{order.customerName}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                      {order.address}
                    </p>
                    <span className="inline-block text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded mt-1">
                      📍 {order.distance} from Darkstore
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-400" />
                    <span>Open Maps</span>
                  </a>

                  <a
                    href={`tel:${order.customerPhone}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  >
                    <Phone className="w-4 h-4 text-green-400" />
                  </a>

                  {!isPickedUp ? (
                    <button
                      onClick={() => handlePickup(order.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Confirm Picked</span>
                    </button>
                  ) : (
                    <div className="flex-1 flex gap-1.5">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="4-digit OTP"
                        value={otpInputs[order.id] || ''}
                        onChange={(e) =>
                          setOtpInputs({ ...otpInputs, [order.id]: e.target.value })
                        }
                        className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-center text-white font-mono tracking-widest"
                      />
                      <button
                        onClick={() => handleVerifyOtp(order)}
                        className="flex-1 py-2 px-2 rounded-xl bg-green-500 hover:bg-green-400 text-black text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Deliver</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
