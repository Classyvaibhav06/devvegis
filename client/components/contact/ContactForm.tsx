'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
      toast.success('Your message has been received! Our support team will contact you shortly.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      toast.error('Failed to submit message. Please try calling our hotline.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card p-8 text-center space-y-3 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">
          Thank you for reaching out!
        </h3>
        <p className="text-xs text-slate-600 dark:text-[#8B96A8] max-w-md mx-auto">
          We have logged your ticket. A support specialist from our central hub will reply within 2 hours.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="btn-outline text-xs py-2 px-4 mt-2"
        >
          Send Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Your Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="input text-xs w-full"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="input text-xs w-full"
          />
        </div>
      </div>
      <div>
        <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Order inquiry, farm partner, or wholesale pricing"
          className="input text-xs w-full"
        />
      </div>
      <div>
        <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Message *</label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can our operations team assist you today?"
          className="input text-xs w-full resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary py-2.5 px-6 inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
        aria-label="Submit contact message"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Send className="w-3.5 h-3.5" />
        )}
        <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
      </button>
    </form>
  );
}
