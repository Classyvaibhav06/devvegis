import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

export function getDiscountedPrice(price: number, discount: number | null): number {
  if (!discount) return price;
  return Math.round(price - (price * discount / 100));
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'text-amber-600 bg-amber-50',
    CONFIRMED: 'text-blue-600 bg-blue-50',
    PACKED: 'text-indigo-600 bg-indigo-50',
    RIDER_ASSIGNED: 'text-purple-600 bg-purple-50',
    ON_THE_WAY: 'text-orange-600 bg-orange-50',
    DELIVERED: 'text-green-600 bg-green-50',
    CANCELLED: 'text-red-600 bg-red-50',
    REFUNDED: 'text-gray-600 bg-gray-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: '⏳ Pending',
    CONFIRMED: '✅ Confirmed',
    PACKED: '📦 Packed',
    RIDER_ASSIGNED: '🛵 Rider Assigned',
    ON_THE_WAY: '🚀 On The Way',
    DELIVERED: '🎉 Delivered',
    CANCELLED: '❌ Cancelled',
    REFUNDED: '💰 Refunded',
  };
  return labels[status] || status;
}

export function generateSKU(name: string): string {
  const prefix = name.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DV-${prefix}-${random}`;
}
