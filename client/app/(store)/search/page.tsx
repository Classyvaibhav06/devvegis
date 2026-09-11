'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Mic, X, TrendingUp, Clock, SlidersHorizontal, Leaf, Star } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

const TRENDING = ['Tomato', 'Alphonso Mango', 'Organic Broccoli', 'Avocado', 'Strawberry', 'Baby Corn'];
const FILTERS_CONFIG = {
  sort: [
    { label: 'Relevance', value: '' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Rating', value: 'rating_desc' },
    { label: 'New Arrivals', value: 'createdAt_desc' },
  ],
};

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="skeleton aspect-square rounded-2xl" />
      <div className="skeleton h-3 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="skeleton h-8 rounded-xl" />
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ sort: '', isOrganic: false, minPrice: '', maxPrice: '' });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('devvegis-recent-searches');
    if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, filters],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { data: [], pagination: { total: 0 } };
      const [sortField, sortOrder] = filters.sort ? filters.sort.split('_') : ['', ''];
      const params = new URLSearchParams({
        q: debouncedQuery,
        ...(filters.isOrganic && { isOrganic: 'true' }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(sortField && { sort: sortField, order: sortOrder }),
        limit: '24',
      });
      const res = await api.get(`/products/search?${params}`);
      return res.data;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
      const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('devvegis-recent-searches', JSON.stringify(updated));
    }
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('devvegis-recent-searches');
  };

  return (
    <div className="container-main py-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search for vegetables, fruits, herbs..."
          className="w-full pl-12 pr-20 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-base focus:outline-none focus:border-green-500 shadow-sm"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button onClick={() => { setQuery(''); setDebouncedQuery(''); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          )}
          <button className="text-gray-400 hover:text-green-600 transition-colors" aria-label="Voice search">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      {debouncedQuery && (
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:border-green-500 hover:text-green-600 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={() => setFilters(f => ({ ...f, isOrganic: !f.isOrganic }))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filters.isOrganic ? 'bg-green-600 text-white' : 'border border-gray-200 dark:border-gray-700 hover:border-green-500'}`}
          >
            <Leaf className="w-4 h-4" />
            Organic Only
          </button>
          {FILTERS_CONFIG.sort.filter(s => s.value).map(s => (
            <button
              key={s.value}
              onClick={() => setFilters(f => ({ ...f, sort: f.sort === s.value ? '' : s.value }))}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filters.sort === s.value ? 'bg-green-600 text-white' : 'border border-gray-200 dark:border-gray-700 hover:border-green-500'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Empty State — show trending */}
      {!debouncedQuery && (
        <div className="space-y-8">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Recent Searches
                </h3>
                <button onClick={clearRecent} className="text-xs text-red-500 hover:text-red-700">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(s => (
                  <button key={s} onClick={() => handleSearch(s)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 hover:text-green-700 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map(term => (
                <button key={term} onClick={() => handleSearch(term)} className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium hover:bg-green-100 transition-all">
                  🔥 {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {debouncedQuery && (
        <div>
          {!isLoading && data && (
            <p className="text-sm text-gray-500 mb-4">
              {data.pagination?.total || 0} results for <strong>"{debouncedQuery}"</strong>
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {isLoading
              ? Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : data?.data?.map((product: any) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            }
          </div>
          {!isLoading && (!data?.data || data.data.length === 0) && (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">No results found</h3>
              <p className="text-gray-500 mb-6">Try a different search term or browse categories</p>
              <a href="/categories" className="btn-primary inline-block">Browse Categories</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-main py-12 text-center text-gray-400">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
