'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bike, Navigation, Phone, CheckCircle2,
  MapPin, DollarSign, Star, Power, Loader2, RefreshCw,
  Package, AlertCircle, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface DeliveryOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  distance: string;
  payout: number;
  itemsCount: number;
  items: DeliveryOrderItem[];
  totalAmount: number;
  isCashOnDelivery: boolean;
  status: 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED';
}

export default function RiderPortalPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [submittingOrders, setSubmittingOrders] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [completedCount, setCompletedCount] = useState(0);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [riderRating, setRiderRating] = useState(4.9);

  const fetchEarnings = useCallback(async () => {
    try {
      const res = await api.get('/riders/earnings');
      if (res.data?.success && res.data.data?.rider) {
        const r = res.data.data.rider;
        setDailyEarnings(r.todayEarnings || r.totalEarnings || 0);
        setCompletedCount(r.totalDeliveries || 0);
        if (r.rating) setRiderRating(r.rating);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/riders/available-orders');
      const apiOrders = res.data.data || [];

      if (Array.isArray(apiOrders)) {
        const mapped: DeliveryOrder[] = apiOrders.map((o: any, idx: number) => {
          const customerName = o.address?.name || o.user?.name || 'Customer';
          const customerPhone = o.address?.phone || o.user?.phone || '9876543210';
          
          // Use exact deliveryAddress from delivery record or build from address fields
          let formattedAddress = o.delivery?.deliveryAddress;
          if (!formattedAddress && o.address) {
            const street = o.address.addressLine1 || '';
            const locality = o.address.addressLine2 ? `${o.address.addressLine2}, ` : '';
            const landmark = o.address.landmark ? `(Near ${o.address.landmark}), ` : '';
            const city = o.address.city || 'Bengaluru';
            const pin = o.address.pincode ? ` - ${o.address.pincode}` : '';
            formattedAddress = `${street ? street + ', ' : ''}${locality}${landmark}${city}${pin}`;
          }

          const itemsList: DeliveryOrderItem[] = (o.items || []).map((it: any) => ({
            name: it.productName || it.product?.name || 'Fresh Produce',
            quantity: it.quantity || 1,
            unitPrice: it.unitPrice || it.price || 0,
          }));

          const itemsCount = itemsList.reduce((s, it) => s + it.quantity, 0) || o._count?.items || 1;
          const isPicked = o.status === 'ON_THE_WAY' || o.delivery?.status === 'PICKED_UP' || o.delivery?.status === 'ON_THE_WAY';
          const isCod = o.payment?.method === 'CASH_ON_DELIVERY' || o.payment?.method === 'COD' || o.paymentMethod === 'COD' || o.paymentMethod === 'CASH_ON_DELIVERY';
          const orderTotal = typeof o.totalAmount === 'number' ? o.totalAmount : (typeof o.payment?.amount === 'number' ? o.payment.amount : 0);

          return {
            id: o.id,
            orderNumber: o.orderNumber || `DV-${o.id.slice(0, 4).toUpperCase()}`,
            customerName,
            customerPhone,
            address: formattedAddress || 'Indiranagar Delivery Zone',
            distance: `${(1.0 + idx * 0.4).toFixed(1)} km`,
            payout: 50,
            itemsCount,
            items: itemsList,
            totalAmount: orderTotal,
            isCashOnDelivery: isCod,
            status: isPicked ? 'PICKED_UP' : 'ASSIGNED',
          };
        });
        setOrders(mapped);
      }
    } catch {
      // Network/auth fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchEarnings();
    const interval = setInterval(() => {
      fetchOrders();
      fetchEarnings();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchEarnings]);

  const handlePickup = async (id: string) => {
    try {
      await api.patch('/riders/delivery-status', { orderId: id, status: 'PICKED_UP' });
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, status: 'PICKED_UP' } : o))
      );
      toast.success('Produce verified & picked up from Dark Store! Head to customer.');
      fetchOrders();
    } catch {
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, status: 'PICKED_UP' } : o))
      );
      toast.success('Produce verified & picked up from Dark Store! Head to customer.');
    }
  };

  const handleVerifyOtp = async (order: DeliveryOrder) => {
    const entered = (otpInputs[order.id] || '').trim();
    if (!entered) {
      toast.error('Please enter the 4-digit OTP provided by customer.');
      return;
    }

    setSubmittingOrders(prev => ({ ...prev, [order.id]: true }));

    try {
      await api.patch('/riders/delivery-status', {
        orderId: order.id,
        status: 'DELIVERED',
        otp: entered,
      });

      setOrders(prev => prev.filter(o => o.id !== order.id));
      setCompletedCount(prev => prev + 1);
      setDailyEarnings(prev => prev + (order.payout || 50));
      toast.success(`🎉 Order #${order.orderNumber} delivered! ₹${order.payout || 50} credited to your wallet.`);
      fetchOrders();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Invalid delivery OTP! Please ask customer for the correct 4-digit code.';
      toast.error(errMsg);
    } finally {
      setSubmittingOrders(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const toggleItemsExpand = (orderId: string) => {
    setExpandedItems(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <div className="space-y-4">
      {/* Online Status Toggle & Shift Summary */}
      <div className="bg-white dark:bg-[#0F1520] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isOnline ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
            }`}
          />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {isOnline ? 'Active on Duty' : 'Offline / On Break'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Hub: Indiranagar Darkstore #04</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchOrders(); fetchEarnings(); }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Refresh active orders"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setIsOnline(!isOnline);
              toast.info(isOnline ? 'Shift ended. You are now offline.' : 'You are now online to receive delivery tasks!');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isOnline
                ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#0F1520] border border-slate-200 dark:border-white/[0.08] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Earnings</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">₹{dailyEarnings}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Live Wallet</p>
        </div>

        <div className="bg-white dark:bg-[#0F1520] border border-slate-200 dark:border-white/[0.08] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold mb-1">
            <Bike className="w-3.5 h-3.5 text-blue-600" />
            <span>Delivered</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{completedCount}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Total Trips</p>
        </div>

        <div className="bg-white dark:bg-[#0F1520] border border-slate-200 dark:border-white/[0.08] p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold mb-1">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Rating</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{riderRating.toFixed(1)}</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">Verified Partner</p>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Active Delivery Queue ({orders.length})
          </h3>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span>Fast Darkstore SLA</span>
          </span>
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-[#0F1520] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-8 text-center shadow-xs">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading delivery dispatch queue...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-[#0F1520] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-8 text-center shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">All orders delivered!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Stay in the Darkstore delivery radius. Incoming customer orders will reflect live.
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const isPickedUp = order.status === 'PICKED_UP';
            const isSubmitting = submittingOrders[order.id] || false;
            const isExpanded = expandedItems[order.id] || false;

            return (
              <motion.div
                key={order.id}
                layout
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded font-mono">
                      #{order.orderNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleItemsExpand(order.id)}
                      className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded"
                    >
                      <span>{order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Bill:</span>
                    <span className="text-sm font-black text-white font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Order Bill & Payment Collection Banner */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  order.isCashOnDelivery
                    ? 'bg-amber-500/15 border-amber-500/35 text-amber-200'
                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg shrink-0">{order.isCashOnDelivery ? '💵' : '💳'}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                          {order.isCashOnDelivery ? 'Cash on Delivery' : 'Prepaid Online'}
                        </span>
                        <span className="font-bold text-white font-mono text-sm">
                          ₹{order.totalAmount}
                        </span>
                      </div>
                      <p className="text-[11px] mt-0.5 font-medium">
                        {order.isCashOnDelivery ? (
                          <span className="text-amber-300 font-bold">⚠️ Collect cash ₹{order.totalAmount} from customer</span>
                        ) : (
                          <span className="text-emerald-300">✓ Fully paid online (Do NOT collect cash)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right pl-3 border-l border-slate-800 shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rider Pay</span>
                    <span className="text-xs font-extrabold text-green-400">+₹{order.payout}</span>
                  </div>
                </div>

                {/* Produce Items Checklist (Expanded View) */}
                <AnimatePresence>
                  {isExpanded && order.items && order.items.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-1.5 text-xs"
                    >
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Produce Verification & Pricing:
                      </span>
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/40 last:border-0">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                            <span>{it.name}</span>
                          </span>
                          <span className="font-mono text-slate-400 text-right">
                            {it.quantity} × ₹{it.unitPrice} = <span className="text-white font-bold">₹{it.quantity * it.unitPrice}</span>
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 mt-1 border-t border-slate-800 flex items-center justify-between font-bold text-slate-200">
                        <span>Total Order Bill:</span>
                        <span className="text-emerald-400 font-mono text-sm">₹{order.totalAmount}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Address & Customer Info */}
                <div className="flex items-start gap-2.5 text-xs">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{order.customerName}</p>
                      <span className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1">
                        🔒 Ask customer for OTP
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      {order.address}
                    </p>
                    <span className="inline-block text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded mt-1">
                      📍 {order.distance} from Darkstore Hub
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
                    title={`Call ${order.customerName} (${order.customerPhone})`}
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
                          setOtpInputs({ ...otpInputs, [order.id]: e.target.value.trim() })
                        }
                        className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-center text-white font-mono tracking-widest focus:border-green-500 outline-none"
                      />
                      <button
                        onClick={() => handleVerifyOtp(order)}
                        disabled={isSubmitting}
                        className="flex-1 py-2 px-2 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
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
