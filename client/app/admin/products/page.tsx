'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package, Plus, Search, Filter, Edit2, Trash2,
  CheckCircle2, AlertTriangle, Eye, Loader2, Sparkles, X, Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import { toast } from 'sonner';
import S3ImageUploader from '@/components/ui/S3ImageUploader';
import { resolveImageUrl } from '@/lib/utils';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    slug: '',
    description: '',
    price: 40,
    mrp: 50,
    unit: '500g',
    stock: 100,
    isOrganic: false,
    categoryId: '',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', search, selectedCategory],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { q: search, limit: 50 },
      });
      return res.data.data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data || [];
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (payload: typeof newProduct) => {
      const res = await api.post('/products', {
        ...payload,
        images: [payload.image],
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setShowAddModal(false);
      toast.success('Product added to catalog!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create product');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...data } = payload;
      const res = await api.put(`/products/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setEditingProduct(null);
      toast.success('Rate, grams & product details updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update product');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted from inventory');
    },
  });

  const products = productsData || [];

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
            Produce & Fruits Management
          </h1>
          <p className="text-xs text-gray-500">
            Add new produce, update rates, grams/pieces, photos, or remove items
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 self-start sm:self-auto shadow-lime"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vegetable / Fruit</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name, grams, or tag..."
            className="input pl-9 text-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input sm:w-48 text-xs"
        >
          <option value="">All Categories</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Item & Photo</th>
                <th className="p-4">Rate (Price / MRP)</th>
                <th className="p-4">Grams / Pieces</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Loading produce catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No items found. Click "Add Vegetable / Fruit" above to add your first item.
                  </td>
                </tr>
              ) : (
                products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-700">
                          {p.images?.[0] ? (
                            <Image
                              src={resolveImageUrl(p.images[0]?.url || p.images[0])}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🥦</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{p.name}</p>
                          <p className="text-[11px] text-gray-400">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-extrabold text-green-600 text-sm">₹{p.price}</span>
                      {(p.comparePrice || p.mrp) && (p.comparePrice || p.mrp) > p.price && (
                        <span className="text-gray-400 line-through text-xs ml-1.5">₹{p.comparePrice || p.mrp}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs">
                        {p.unit || '500g'}
                      </span>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const currentStock = p.inventory?.availableStock !== undefined ? p.inventory.availableStock : (p.stock || 0);
                        return (
                          <span className={`font-semibold ${currentStock <= 15 ? 'text-rose-600 font-bold' : 'text-green-600'}`}>
                            {currentStock} units
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-4">
                      {p.isOrganic ? (
                        <span className="badge-green">Organic</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">Regular</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingProduct({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            mrp: p.comparePrice || p.mrp || p.price + 10,
                            comparePrice: p.comparePrice || p.mrp || p.price + 10,
                            unit: p.unit || '500g',
                            stock: p.inventory?.availableStock !== undefined ? p.inventory.availableStock : (p.stock || 50),
                            isOrganic: p.isOrganic || false,
                            image: p.images?.[0]?.url || p.images?.[0] || '',
                          })}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                          title="Edit Rate, Grams & Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                              deleteProductMutation.mutate(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-green-600" />
                <span>Edit Produce Rate & Grams</span>
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProductMutation.mutate(editingProduct);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Selling Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="input text-xs font-bold text-green-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.mrp}
                    onChange={(e) => setEditingProduct({ ...editingProduct, mrp: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Grams / Pieces / Unit</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    placeholder="e.g. 500g, 1 Kg, 6 Pcs"
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <S3ImageUploader
                label="Product Image"
                value={editingProduct.image}
                onChange={(url) => setEditingProduct({ ...editingProduct, image: url })}
                folder="products"
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editOrganic"
                  checked={editingProduct.isOrganic}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isOrganic: e.target.checked })}
                  className="text-green-600 rounded"
                />
                <label htmlFor="editOrganic" className="text-xs font-medium cursor-pointer">
                  Certified Organic Item
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-lime"
                >
                  {updateProductMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-gray-100">
                Add New Vegetable / Fruit
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createProductMutation.mutate(newProduct);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-semibold block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })}
                  placeholder="e.g. Fresh Shimla Apple"
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Selling Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="input text-xs font-bold text-green-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.mrp}
                    onChange={(e) => setNewProduct({ ...newProduct, mrp: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Grams / Pieces / Unit</label>
                  <input
                    type="text"
                    required
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    placeholder="e.g. 500g, 1 Kg, 4 Pcs"
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <S3ImageUploader
                label="Product Image"
                value={newProduct.image}
                onChange={(url) => setNewProduct({ ...newProduct, image: url })}
                folder="products"
                required
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="organic"
                  checked={newProduct.isOrganic}
                  onChange={(e) => setNewProduct({ ...newProduct, isOrganic: e.target.checked })}
                  className="text-green-600 rounded"
                />
                <label htmlFor="organic" className="text-xs font-medium cursor-pointer">
                  Certified Organic Produce
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-lime"
                >
                  {createProductMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
