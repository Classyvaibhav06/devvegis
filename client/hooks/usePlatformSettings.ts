'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface PlatformSettingsData {
  targetDeliveryMinutes: number;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  darkstoreRadiusKm: number;
  deliverySlots?: { id: string; title: string; desc: string; badge: string }[];
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsData = {
  targetDeliveryMinutes: 12,
  baseDeliveryFee: 40,
  freeDeliveryThreshold: 100,
  darkstoreRadiusKm: 8,
};

export function usePlatformSettings() {
  const query = useQuery<PlatformSettingsData>({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data?.success && res.data?.data) {
          return {
            targetDeliveryMinutes: Number(res.data.data.targetDeliveryMinutes ?? DEFAULT_PLATFORM_SETTINGS.targetDeliveryMinutes),
            baseDeliveryFee: Number(res.data.data.baseDeliveryFee ?? DEFAULT_PLATFORM_SETTINGS.baseDeliveryFee),
            freeDeliveryThreshold: Number(res.data.data.freeDeliveryThreshold ?? DEFAULT_PLATFORM_SETTINGS.freeDeliveryThreshold),
            darkstoreRadiusKm: Number(res.data.data.darkstoreRadiusKm ?? DEFAULT_PLATFORM_SETTINGS.darkstoreRadiusKm),
            deliverySlots: res.data.data.deliverySlots,
          };
        }
      } catch (err) {
        console.warn('Could not fetch dynamic platform settings, using defaults:', err);
      }
      return DEFAULT_PLATFORM_SETTINGS;
    },
    staleTime: 1000 * 60 * 3, // Cache for 3 minutes before refetch
    initialData: DEFAULT_PLATFORM_SETTINGS,
  });

  const settings = query.data ?? DEFAULT_PLATFORM_SETTINGS;

  return {
    ...query,
    settings,
    baseDeliveryFee: settings.baseDeliveryFee,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
    targetDeliveryMinutes: settings.targetDeliveryMinutes,
  };
}
