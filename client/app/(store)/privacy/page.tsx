import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | DevVegis Technologies Pvt. Ltd.',
  description: 'DevVegis Privacy Policy detailing how we collect, safeguard, and process your personal and payment data in compliance with Indian IT laws.',
};

export default function PrivacyPage() {
  return (
    <div className="container-main py-10 max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 dark:text-[#8B96A8]">Last updated: September 17, 2026</p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-[#8B96A8] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">1. Information We Collect</h2>
          <p>
            When you create an account, order produce, or sign up as a B2B wholesale merchant, DevVegis Technologies Pvt. Ltd. collects information including your name, delivery address, phone number, email address, GPS delivery coordinates, and transaction records.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">2. How We Use Your Data</h2>
          <p>
            We use your data solely to fulfill and dispatch your fresh grocery orders within our 12-minute window, calculate exact delivery routing for our rider fleet, generate automated GST invoices, process wallet transactions, and notify you regarding order status.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">3. Payment & Card Security</h2>
          <p>
            DevVegis does not store raw credit/debit card numbers or UPI PINs on its servers. All digital payments are processed through PCI-DSS Level 1 certified payment gateways (Razorpay).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">4. Contact Our Data Grievance Officer</h2>
          <p>
            Email: privacy@devvegis.com<br />
            Address: DevVegis Technologies Pvt. Ltd., Indiranagar Central Dark Store, Bengaluru, KA 560038
          </p>
        </section>
      </div>
    </div>
  );
}
