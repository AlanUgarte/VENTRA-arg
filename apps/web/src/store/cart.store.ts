import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  rubroName: string;
  precioVenta: number;
  costoReal: number;
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  discountPct: number;
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => string | null;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  setDiscount: (pct: number) => void;
  clear: () => void;
  totals: () => { subtotal: number; discountAmount: number; total: number };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discountPct: 0,

  addItem: (item, qty = 1) => {
    const existing = get().items.find((i) => i.productId === item.productId);
    const currentQty = existing?.quantity ?? 0;
    if (currentQty + qty > item.stock) return 'Stock insuficiente';

    set((state) => ({
      items: existing
        ? state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + qty }
              : i,
          )
        : [...state.items, { ...item, quantity: qty }],
    }));
    return null;
  },

  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

  updateQty: (productId, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => i.productId !== productId)
          : state.items.map((i) =>
              i.productId === productId ? { ...i, quantity: qty } : i,
            ),
    })),

  setDiscount: (pct) => set({ discountPct: Math.min(100, Math.max(0, pct)) }),

  clear: () => set({ items: [], discountPct: 0 }),

  totals: () => {
    const { items, discountPct } = get();
    const subtotal = items.reduce((s, i) => s + i.precioVenta * i.quantity, 0);
    const discountAmount = Math.round((subtotal * discountPct) / 100);
    return { subtotal, discountAmount, total: subtotal - discountAmount };
  },
}));
