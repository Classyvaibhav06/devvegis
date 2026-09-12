'use client';

import { Settings, Shield, Sliders, Database, Bell, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-green-600" />
          <span>Platform Settings</span>
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure quick-commerce delivery SLAs, darkstore operational radius, and store preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery SLAs */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100">
            <Sliders className="w-4 h-4 text-green-600" />
            <span>Fulfillment Dispatch SLA</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1">Target Delivery Time (Minutes)</label>
              <input
                type="number"
                defaultValue={12}
                className="input text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1">Base Delivery Fee (₹)</label>
              <input
                type="number"
                defaultValue={25}
                className="input text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                defaultValue={199}
                className="input text-xs"
              />
            </div>

            <button
              onClick={() => toast.success('Delivery SLA preferences saved')}
              className="btn-primary text-xs py-2 w-full mt-2"
            >
              Save Delivery Rules
            </button>
          </div>
        </div>

        {/* Database & Cloud Info */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Infrastructure Status</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Database</span>
              <span className="font-semibold text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Neon Serverless Postgres
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Branch</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">production</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500">Fast Darkstores Active</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">Indiranagar #04, Koramangala #02</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-500">Real-time Order Polling</span>
              <span className="badge-green">Active (4s Heartbeat)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
