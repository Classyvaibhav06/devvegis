import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | DevVegis Grocery Platform',
  description: 'DevVegis Terms of Service governing retail produce orders, B2B wholesale Mandi contracts, and rider delivery operations.',
};

export default function TermsPage() {
  return (
    <div className="container-main py-10 max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-500 dark:text-[#8B96A8]">Last updated: September 17, 2026</p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-[#8B96A8] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">1. Acceptance of Terms</h2>
          <p>
            By creating an account or placing an order on devvegis.com or associated mobile applications, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">2. Pricing & Weight Variations</h2>
          <p>
            Fresh produce is naturally variable in size and moisture content. All weights are calibrated on certified electronic scales before packing. An acceptable variance of +/- 5% may occur due to cutting and packaging constraints.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">3. Delivery Times & Slots</h2>
          <p>
            Our 12-minute express delivery is an operational target supported by our dark store proximity. Delivery times may vary during adverse weather conditions, peak Bangalore traffic congestion, or public holidays.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">4. Governing Law & Jurisdiction</h2>
          <p>
            These terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.
          </p>
        </section>
      </div>
    </div>
  );
}
