import type { Metadata } from 'next';
import { RotateCcw, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — Quick Resolution | DevVegis',
  description: 'DevVegis customer-first refund policy. 100% resolution on compromised produce items within 2 hours of delivery.',
};

export default function RefundsPage() {
  return (
    <div className="container-main py-10 max-w-4xl space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
          Refund & Cancellation Policy
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#8B96A8]">
          Transparent, frictionless, and customer-first. We stand behind every produce order.
        </p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-[#8B96A8] leading-relaxed">
        <div className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">
            1. Fresh Produce Quality Claims
          </h2>
          <p>
            Because fresh vegetables and fruits are perishable, we request customers to inspect their delivery upon arrival. If any item is wilted, bruised, punctured, or unsatisfactory, you may request a refund within <strong>2 hours</strong> of delivery through your DevVegis app or web account.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">
            2. Refund Processing Time
          </h2>
          <p>
            • <strong>Original Payment Method (UPI / Card / Net Banking):</strong> Processed within 24–48 hours as per standard banking settlement cycles.<br />
            • <strong>Cash on Delivery (COD):</strong> Refunded via direct UPI transfer or account credit upon verification by our customer support team.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">
            3. Order Cancellation
          </h2>
          <p>
            Orders can be cancelled free of charge while in "PENDING" or "CONFIRMED" status before our fulfillment rider is dispatched from the dark store. Once an order is "OUT FOR DELIVERY", cancellation is not permitted due to the perishable nature of fresh produce.
          </p>
        </div>
      </div>
    </div>
  );
}
