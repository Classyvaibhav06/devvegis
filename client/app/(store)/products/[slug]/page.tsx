'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Star, Heart, ShoppingCart, Leaf, Zap, Shield, Truck, ChevronLeft,
  ChevronRight, Plus, Minus, Check, Share2, PackageSearch
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency, getDiscountedPrice } from '@/lib/utils';
import api from '@/lib/api';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'nutrition' | 'reviews'>('details');
  const { items, addItem, updateQuantity } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await api.get(`/products/${slug}`)).data.data,
  });

  const product = data;
  const cartItem = items.find(i => i.id === product?.id);
  const quantity = cartItem?.quantity || 0;
  const finalPrice = product?.discountPercentage
    ? getDiscountedPrice(product.price, product.discountPercentage)
    : product?.price;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: finalPrice, image: product.images?.[0]?.url, unit: product.unit });
    toast.success(`${product.name} added to cart`, { duration: 2000 });
  };

  if (isLoading) {
    return (
      <div className="container-main py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="skeleton aspect-square rounded-[2px]" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded-[2px]" />
            <div className="skeleton h-5 w-1/4 rounded-[2px]" />
            <div className="skeleton h-12 w-1/2 rounded-[2px]" />
            <div className="skeleton h-24 rounded-[2px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-main py-20 text-center">
        <div className="w-16 h-16 rounded-[2px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <PackageSearch className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Product not found</h2>
        <Link href="/categories/vegetables" className="btn-primary inline-block mt-4 rounded-[2px]">Browse Categories</Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [{ url: '/placeholder-vegetable.jpg' }];

  return (
    <div className="container-main py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-green-600">Home</Link>
        <span>/</span>
        <Link href={`/categories/${product.category?.slug}`} className="hover:text-green-600">{product.category?.name}</Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-300 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div className="space-y-3">
          <motion.div
            className="relative aspect-square rounded-[2px] overflow-hidden bg-gray-50 dark:bg-gray-800 border border-slate-200 dark:border-white/10"
            layoutId={`product-image-${product.id}`}
          >
            <Image
              src={images[selectedImage]?.url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {product.discountPercentage > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-[2px]">
                {Math.round(product.discountPercentage)}% OFF
              </div>
            )}
          </motion.div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 shrink-0 rounded-[2px] overflow-hidden border-2 transition-all cursor-pointer ${i === selectedImage ? 'border-green-500' : 'border-slate-200 dark:border-white/10'}`}
                >
                  <Image src={img.url} alt={`View ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.isOrganic && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-[2px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <Leaf className="w-3 h-3" /> Organic
                </span>
              )}
              {product.isFreshToday && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-[2px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  <Zap className="w-3 h-3" /> Fresh Today
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500 font-mono">({product.reviewCount || 0} reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-green-600">{formatCurrency(finalPrice)}</span>
            {product.comparePrice && <span className="text-lg text-gray-400 line-through">{formatCurrency(product.comparePrice)}</span>}
            <span className="text-sm text-gray-500">/ {product.unit}</span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            {(product.inStock !== undefined ? product.inStock : (product.inventory?.availableStock > 0)) ? (
              <span className="text-green-600 font-semibold flex items-center gap-1"><Check className="w-4 h-4 stroke-[3]" />In Stock</span>
            ) : (
              <span className="text-red-500 font-semibold">Out of Stock</span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{product.description}</p>

          {/* Cart Controls */}
          <div className="flex items-center gap-3">
            {quantity === 0 ? (
              <button
                onClick={handleAddToCart}
                disabled={!(product.inStock !== undefined ? product.inStock : (product.inventory?.availableStock > 0))}
                className="btn-primary flex items-center gap-2 flex-1 justify-center rounded-[2px] active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center bg-green-600 rounded-[2px] overflow-hidden flex-1 justify-center shadow-xs">
                <button onClick={() => updateQuantity(product.id, quantity - 1)} className="p-3 text-white hover:bg-green-700 transition-colors cursor-pointer">
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-white font-bold text-lg px-6 font-mono">{quantity}</span>
                <button onClick={() => addItem({ id: product.id, name: product.name, price: finalPrice, image: images[0]?.url, unit: product.unit })} className="p-3 text-white hover:bg-green-700 transition-colors cursor-pointer">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="p-3 rounded-[2px] border border-gray-200 dark:border-gray-700 hover:border-red-300 transition-all cursor-pointer active:translate-y-0.5"
            >
              <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
              className="p-3 rounded-[2px] border border-gray-200 dark:border-gray-700 hover:border-green-300 transition-all cursor-pointer active:translate-y-0.5"
            >
              <Share2 className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck, label: 'Fast Delivery', sub: '10-30 mins' },
              { icon: Shield, label: 'Freshness', sub: 'Guaranteed' },
              { icon: Leaf, label: 'Farm Fresh', sub: 'Direct' },
            ].map(b => (
              <div key={b.label} className="flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-[2px] border border-slate-200/60 dark:border-white/[0.05]">
                <b.icon className="w-5 h-5 text-green-600" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{b.label}</span>
                <span className="text-[11px] text-gray-400">{b.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
          {(['details', 'nutrition', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold capitalize transition-colors cursor-pointer ${activeTab === tab ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'reviews' ? `Reviews (${product.reviews?.length || 0})` : tab === 'nutrition' ? 'Nutrition' : 'Details'}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-2">
            <p>{product.description || 'Fresh and naturally grown produce, harvested with care and delivered to your doorstep.'}</p>
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-[2px] border border-green-500/20">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {product.reviews?.length === 0 && <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>}
            {product.reviews?.map((review: any) => (
              <div key={review.id} className="card p-4 rounded-[2px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-[2px] flex items-center justify-center text-green-700 font-bold text-sm">
                    {review.user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.user?.name}</p>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{review.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Similar Products */}
      {product.similar?.length > 0 && (
        <section>
          <h2 className="text-xl font-heading font-extrabold text-gray-900 dark:text-gray-100 mb-4">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {product.similar.slice(0, 6).map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
