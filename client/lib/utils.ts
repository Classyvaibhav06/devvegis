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

/**
 * Resolves and sanitizes image URLs:
 * - Fixes pasted or malformed URLs like "API_URL=https://..." or "http://localhost:5000/uploads/..."
 * - Normalizes local/Render upload paths to point to the live backend URL.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&q=80';
  }

  let cleaned = url.trim();

  // Strip accidental "API_URL=" or "NEXT_PUBLIC_API_URL=" prefix from input
  if (cleaned.includes('API_URL=')) {
    cleaned = cleaned.replace(/^.*API_URL=/, '');
  }

  // Fix broken schemes like "https:/devvegis.onrender.com" -> "https://devvegis.onrender.com"
  cleaned = cleaned.replace(/^(https?):\/([^\/])/, '$1://$2');

  const fallbackApi = process.env.NODE_ENV === 'production'
    ? 'https://br-snowy-frog-a5ydvjfe-api.compute.c-1.us-east-2.aws.neon.tech/api/v1'
    : 'http://localhost:5000/api/v1';
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || fallbackApi).replace(/\/api\/v1\/?$/, '');
  if (cleaned.startsWith('http://localhost:5000/uploads')) {
    cleaned = cleaned.replace('http://localhost:5000', apiBase);
  } else if (cleaned.startsWith('/uploads')) {
    cleaned = `${apiBase}${cleaned}`;
  }

  return cleaned;
}

/**
 * Formats a product's unit and weight for display in cards and product pages.
 * Handles database enums (GRAM, KG, PIECE, etc.) combined with numeric weight (e.g. 200 -> "200g", 50 -> "50g", 1000 -> "1 kg").
 */
export function formatProductWeight(
  product?: { unit?: string; weight?: number | string | null } | string | null,
  fallbackWeight?: number | string | null
): string {
  if (!product) return '500g';

  let unitStr = '';
  let weightNum: number | null = null;

  if (typeof product === 'object') {
    unitStr = String(product.unit || '').trim();
    const rawW = product.weight ?? fallbackWeight;
    weightNum = rawW !== null && rawW !== undefined && rawW !== '' ? parseFloat(String(rawW)) : null;
  } else if (typeof product === 'string') {
    unitStr = product.trim();
    if (fallbackWeight !== null && fallbackWeight !== undefined && fallbackWeight !== '') {
      weightNum = parseFloat(String(fallbackWeight));
    }
  }

  // If a valid positive weight was entered/stored:
  if (weightNum !== null && !isNaN(weightNum) && weightNum > 0) {
    const upper = unitStr.toUpperCase();
    if (upper === 'KG' || (weightNum >= 1000 && weightNum % 1000 === 0)) {
      return `${weightNum / 1000} kg`;
    }
    if (upper === 'KG' || weightNum >= 1000) {
      return `${(weightNum / 1000).toFixed(1).replace(/\.0$/, '')} kg`;
    }
    if (upper === 'PIECE') {
      return `${weightNum} pc`;
    }
    if (upper === 'DOZEN') {
      return `${weightNum} dozen`;
    }
    if (upper === 'BUNDLE') {
      return `${weightNum} bundle`;
    }
    if (upper === 'LITRE') {
      return weightNum >= 1000 ? `${weightNum / 1000} L` : `${weightNum} ml`;
    }
    return `${weightNum}g`;
  }

  // If unit string already contains numeric quantities (e.g. "500g", "250g", "1 kg", "6 pcs")
  if (/\d/.test(unitStr)) {
    return unitStr;
  }

  // Fallback for bare database enums without weight
  switch (unitStr.toUpperCase()) {
    case 'KG':
      return '1 kg';
    case 'PIECE':
      return '1 pc';
    case 'DOZEN':
      return '1 dozen';
    case 'BUNDLE':
      return '1 bundle';
    case 'LITRE':
      return '1 L';
    case 'GRAM':
    default:
      return '500g';
  }
}
