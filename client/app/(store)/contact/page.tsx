import type { Metadata } from 'next';
import { MapPin, Phone, Mail } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact DevVegis — Customer Support & Central Dark Store Location',
  description: 'Reach DevVegis customer support hotline 1800-DEV-VEGIS or visit our Indiranagar Dark Store hub in Bengaluru. 24/7 express grocery support.',
};

export default function ContactPage() {
  return (
    <div className="container-main py-10 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
          We are Here to Help
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#8B96A8]">
          Have a question about an order, dawn harvest arrival, or wholesale inquiry? Get in touch with our team directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-[#E8EEF8]">Central Fulfillment Dark Store</h3>
              <p className="text-xs text-slate-600 dark:text-[#8B96A8] mt-1 leading-relaxed">
                DevVegis Technologies Pvt. Ltd.<br />
                Indiranagar Central Dark Store, 100ft Road,<br />
                HAL 2nd Stage, Bengaluru, Karnataka 560038
              </p>
            </div>
          </div>

          <div className="card p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-[#E8EEF8]">Customer Care Hotline</h3>
              <p className="text-xs text-slate-600 dark:text-[#8B96A8] mt-1">
                Toll Free: <strong>1800-DEV-VEGIS</strong> (1800-338-83447)<br />
                Operational: 05:00 AM – 11:30 PM (Daily)
              </p>
            </div>
          </div>

          <div className="card p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-[#E8EEF8]">Email Inquiries</h3>
              <p className="text-xs text-slate-600 dark:text-[#8B96A8] mt-1">
                Orders: orders@devvegis.com<br />
                Wholesale: b2b@devvegis.com<br />
                Press: press@devvegis.com
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 card p-6 sm:p-8 space-y-4">
          <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-[#E8EEF8]">
            Send Us a Message
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
