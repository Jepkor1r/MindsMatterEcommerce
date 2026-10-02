/*
 * ============================================
 * CART CONTEXT
 * ============================================
 * This is the "brain" of the shopping cart.
 *
 * React Context is like a shared notice board
 * that any component in the app can read from
 * and write to. Instead of passing cart data
 * through every component as props, any
 * component can simply "look at the board."
 *
 * PERSISTENCE: We use localStorage to save the
 * cart. This means the cart survives page
 * refreshes. Think of localStorage as a small
 * notebook the browser keeps — even when you
 * close the tab, the notebook stays.
 *
 * No login is required to use the cart.
 * ============================================
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../../types';

// ── Define what the cart context provides ──
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

// ── Create the context (the "notice board") ──
const CartContext = createContext<CartContextType | undefined>(undefined);

// ── Key used to store cart in localStorage ──
const CART_STORAGE_KEY = 'minds-matter-cart';

/**
 * Load cart items from localStorage.
 * If nothing is saved, return an empty array.
 */
function loadCartFromStorage(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // If localStorage is corrupted, start fresh
    console.warn('Failed to load cart from localStorage');
  }
  return [];
}

/**
 * Save cart items to localStorage.
 */
function saveCartToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.warn('Failed to save cart to localStorage');
  }
}

// ── Cart Provider component ──
// Wrap the app with this to make cart available everywhere
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);

  // Save to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  // Add a product to the cart (or increase quantity if already there)
  function addItem(product: Product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        // Product already in cart — increase quantity
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock_quantity) }
            : item
        );
      }
      // New product — add to cart
      return [...prev, { product, quantity: Math.min(quantity, product.stock_quantity) }];
    });
  }

  // Remove a product entirely from the cart
  function removeItem(productId: string) {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }

  // Update the quantity of a specific product
  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock_quantity) }
          : item
      )
    );
  }

  // Clear the entire cart
  function clearCart() {
    setItems([]);
  }

  // Total number of items in cart
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Cart subtotal (sum of price × quantity)
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Custom hook to use the cart from any component.
 *
 * Usage:
 *   const { items, addItem, subtotal } = useCart();
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
