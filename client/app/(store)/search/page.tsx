'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Mic, X, TrendingUp, Clock, SlidersHorizontal, Leaf, PackageSearch } from 'lucide-react';
import { toast } from 'sonner';
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
    <div className="flex flex-col gap-2 p-3.5 bg-white dark:bg-[#0F1520] border border-slate-200/80 dark:border-white/[0.07] rounded-[2px]">
      <div className="skeleton aspect-square rounded-[2px]" />
      <div className="skeleton h-3 w-3/4 rounded-[2px]" />
      <div className="skeleton h-3 w-1/2 rounded-[2px]" />
      <div className="skeleton h-8 rounded-[2px]" />
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

  const [isListening, setIsListening] = useState(false);

  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.info('Voice search is not supported in this browser. Please type your search.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.onstart = () => {
        setIsListening(true);
        toast.info('Listening... speak now');
      };
      recognition.onresult = (event: any) => {
        setIsListening(false);
        const speechText = event.results[0]?.[0]?.transcript;
        if (speechText) {
          handleSearch(speechText);
          toast.success(`Searching for "${speechText}"`);
        }
      };
      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Could not detect speech. Please try again or type.');
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } catch {
      setIsListening(false);
      toast.error('Voice search failed to initialize.');
    }
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
          className="w-full pl-12 pr-20 py-3.5 bg-white dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 rounded-[2px] text-base focus:outline-none focus:border-green-500 shadow-xs"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={() => { setQuery(''); setDebouncedQuery(''); }}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`transition-colors cursor-pointer p-1 rounded-[2px] ${
              isListening
                ? 'text-emerald-500 animate-pulse bg-emerald-500/10'
                : 'text-gray-400 hover:text-green-600'
            }`}
            aria-label="Voice search by speaking"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      {debouncedQuery && (
        <div className="flex items-center gap-2.5 mb-6 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 dark:border-white/10 rounded-[2px] text-xs font-bold hover:border-green-500 hover:text-green-600 transition-all cursor-pointer active:translate-y-0.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setFilters(f => ({ ...f, isOrganic: !f.isOrganic }))}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer active:translate-y-0.5 ${filters.isOrganic ? 'bg-green-600 text-white' : 'border border-slate-200 dark:border-white/10 hover:border-green-500'}`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Organic Only</span>
          </button>
          {FILTERS_CONFIG.sort.filter(s => s.value).map(s => (
            <button
              key={s.value}
              onClick={() => setFilters(f => ({ ...f, sort: f.sort === s.value ? '' : s.value }))}
              className={`px-3.5 py-1.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer active:translate-y-0.5 ${filters.sort === s.value ? 'bg-green-600 text-white' : 'border border-slate-200 dark:border-white/10 hover:border-green-500'}`}
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
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Recent Searches</span>
                </h3>
                <button onClick={clearRecent} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-[#161E2E] rounded-[2px] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-green-50 hover:text-green-700 border border-slate-200/60 dark:border-white/[0.05] transition-all cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Trending Searches</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map(term => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-[2px] text-xs font-semibold hover:bg-green-100 transition-all cursor-pointer"
                >
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span>{term}</span>
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
            <p className="text-sm text-gray-500 mb-4 font-mono">
              {data.pagination?.total || 0} results for <strong>"{debouncedQuery}"</strong>
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {isLoading
              ? Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : data?.data?.map((product: any) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            }
          </div>
          {!isLoading && (!data?.data || data.data.length === 0) && (
            <div className="text-center py-16 bg-white dark:bg-[#0F1520] border border-slate-200/80 dark:border-white/[0.07] rounded-[2px]">
              <div className="w-14 h-14 mx-auto mb-3 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] flex items-center justify-center text-slate-400">
                <PackageSearch className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">No results found</h3>
              <p className="text-xs text-gray-500 mb-5">Try a different search term or browse categories</p>
              <a href="/categories/vegetables" className="btn-primary inline-block text-xs py-2 px-4 rounded-[2px]">Browse Categories</a>
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
