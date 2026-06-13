import { create } from 'zustand';

export interface CartItem {
  id: string;       // productId (để key)
  _id?: string;     // productId MongoDB
  variantId: string; // variantId (bắt buộc để tạo đơn hàng)
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

const calcTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  total: 0,

  addItem: (item) =>
    set((state) => {
      // Key theo variantId vì mỗi variant (size/màu) là 1 dòng riêng trong giỏ
      const existing = state.items.find((i) => i.variantId === item.variantId);
      let newItems: CartItem[];

      if (existing) {
        // Tăng số lượng nếu variant đã có trong giỏ
        newItems = state.items.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        newItems = [...state.items, { ...item, quantity: item.quantity || 1 }];
      }

      return { items: newItems, total: calcTotal(newItems) };
    }),

  removeItem: (variantId) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.variantId !== variantId);
      return { items: newItems, total: calcTotal(newItems) };
    }),

  updateQuantity: (variantId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter((i) => i.variantId !== variantId);
        return { items: newItems, total: calcTotal(newItems) };
      }
      const newItems = state.items.map((i) =>
        i.variantId === variantId ? { ...i, quantity } : i
      );
      return { items: newItems, total: calcTotal(newItems) };
    }),

  clearCart: () => set({ items: [], total: 0 }),
}));