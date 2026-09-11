import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  unit: string;
  maxStock?: number;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem: (newItem) => {
        set(state => {
          const existing = state.items.find(i => i.id === newItem.id);
          let items: CartItem[];
          if (existing) {
            items = state.items.map(i => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i);
          } else {
            items = [...state.items, { ...newItem, quantity: 1 }];
          }
          return {
            items,
            itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
            total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
          };
        });
      },

      removeItem: (id) => {
        set(state => {
          const items = state.items.filter(i => i.id !== id);
          return {
            items,
            itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
            total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
          };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) { get().removeItem(id); return; }
        set(state => {
          const items = state.items.map(i => i.id === id ? { ...i, quantity } : i);
          return {
            items,
            itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
            total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
          };
        });
      },

      clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
    }),
    {
      name: 'devvegis-cart',
    }
  )
);
