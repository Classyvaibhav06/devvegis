import { MetadataRoute } from 'next';
import { API_URL as API } from '@/lib/api';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://devvegis.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Core Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/wholesale`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/ai-recipe`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/ai-freshness`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/quality`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/food-safety`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/help`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/refunds`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/careers`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/press`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(`${API}/categories`, { next: { revalidate: 3600 } }).then(r => r.json()).catch(() => null),
      fetch(`${API}/products?limit=100`, { next: { revalidate: 3600 } }).then(r => r.json()).catch(() => null),
    ]);

    if (categoriesRes?.data && Array.isArray(categoriesRes.data)) {
      categoryRoutes = categoriesRes.data.map((cat: any) => ({
        url: `${BASE_URL}/categories/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.85,
      }));
    }

    if (productsRes?.data && Array.isArray(productsRes.data)) {
      productRoutes = productsRes.data.map((prod: any) => ({
        url: `${BASE_URL}/products/${prod.slug}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
    }
  } catch {
    // Fallback static categories
    const fallbackCategories = ['vegetables', 'fruits', 'organic', 'leafy-greens', 'herbs-spices', 'dry-fruits-nuts'];
    categoryRoutes = fallbackCategories.map(slug => ({
      url: `${BASE_URL}/categories/${slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }));
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
