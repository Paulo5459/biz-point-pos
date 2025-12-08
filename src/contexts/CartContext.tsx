import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, PaymentMethod } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyItemDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalDiscount: number;
  total: number;
  globalDiscount: number;
  setGlobalDiscount: (discount: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);

  const addItem = (product: Product) => {
    setItems(current => {
      const existing = current.find(item => item.product.id === product.id);
      if (existing) {
        return current.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { product, quantity: 1, discount: 0 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(current => current.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(current =>
      current.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const applyItemDiscount = (productId: string, discount: number) => {
    setItems(current =>
      current.map(item =>
        item.product.id === productId ? { ...item, discount } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setGlobalDiscount(0);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0
  );

  const itemDiscounts = items.reduce((sum, item) => sum + item.discount, 0);
  const totalDiscount = itemDiscounts + globalDiscount;
  const total = Math.max(0, subtotal - totalDiscount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        applyItemDiscount,
        clearCart,
        subtotal,
        totalDiscount,
        total,
        globalDiscount,
        setGlobalDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
