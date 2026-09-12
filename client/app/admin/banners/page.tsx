'use client';

import { useQuery } from '@tanstack/react-query';
import { Image as ImageIcon, Plus, ExternalLink, Calendar } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';

export default function AdminBannersPage() {
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const res = await api.get('/banners');
      return res.data.data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-green-600" />
            <span>Marketing Banners</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage storefront promotional hero sliders, offer banners, and campaign creative
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="skeleton h-36 w-full rounded-xl" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          ))
        ) : banners.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-gray-500">
            No banners currently active.
          </div>
        ) : (
          banners.map((b: any) => (
            <div key={b.id} className="card overflow-hidden group">
              <div className="relative h-40 w-full bg-gray-100 dark:bg-gray-800">
                {b.imageUrl ? (
                  <Image src={b.imageUrl} alt={b.title || 'Banner'} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>
                )}
                <span className="absolute top-2 right-2 badge-green text-[10px] font-bold">
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                  {b.title || 'Promotional Banner'}
                </h3>
                {b.subtitle && (
                  <p className="text-xs text-gray-500 line-clamp-1">{b.subtitle}</p>
                )}
                {b.linkUrl && (
                  <a
                    href={b.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline pt-1"
                  >
                    <span>Link Target</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
