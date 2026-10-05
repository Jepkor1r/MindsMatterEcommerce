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
 * WHERE THE CART IS SAVED:
 * - Signed OUT: in localStorage (a small notebook
 *   the browser keeps), exactly like before.
 * - Signed IN: in the Supabase `cart_items` table,
 *   tied to the user's account. The mobile app
 *   reads and writes the SAME rows, which is how
 *   the cart syncs between website and phone.
 *
 * When someone signs in, anything they added
 * while signed out is moved into their account.
 *
 * The cart is re-loaded whenever the browser tab
 * becomes visible again, so items added on the
 * phone show up without a manual refresh.
 *
 * No login is required to use the cart.
 * ============================================
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../../types';
import { useAuth } from '../auth/AuthContext';
import {
  addToRemoteCart,
  clearRemoteCart,
  fetchRemoteCart,
  removeFromRemoteCart,
  setRemoteCartQuantity,
} from '../../services/cart';

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

// ── Key used to store the signed-out cart in localStorage ──
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

// ── Pure helpers: work out the new cart list (used in both modes) ──
function withAdded(prev: CartItem[], product: Product, quantity: number): CartItem[] {
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
}

function withQuantity(prev: CartItem[], productId: string, quantity: number): CartItem[] {
  return prev.map((item) =>
    item.product.id === productId
      ? { ...item, quantity: Math.min(quantity, item.product.stock_quantity) }
      : item
  );
}

// ── Cart Provider component ──
// Wrap the app with this (inside AuthProvider) to make cart available everywhere
export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);

  // Each cart load gets a number; only the newest load is allowed to update the
  // screen (so a slow, older response can't overwrite a newer one).
  const loadCounter = useRef(0);

  // Re-load the signed-in user's cart from Supabase (the source of truth)
  const refreshCart = useCallback(async () => {
    if (!userId) return;
    const thisLoad = ++loadCounter.current;
    const remoteItems = await fetchRemoteCart();
    if (remoteItems && thisLoad === loadCounter.current) {
      setItems(remoteItems);
    }
  }, [userId]);

  // When someone signs in: move the signed-out cart into their account, then load it.
  // When someone signs out: go back to the (now empty) browser cart.
  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      loadCounter.current++; // ignore any cart load still in flight
      setItems(loadCartFromStorage());
      return;
    }

    let cancelled = false;
    (async () => {
      const guestItems = loadCartFromStorage();
      if (guestItems.length > 0) {
        // Clear first so the same items are never moved twice
        saveCartToStorage([]);
        for (const { product, quantity } of guestItems) {
          await addToRemoteCart(product.id, quantity);
        }
      }
      if (!cancelled) await refreshCart();
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, authLoading, refreshCart]);

  // Re-load when the user comes back to this tab (e.g. after adding items on the phone)
  useEffect(() => {
    if (!userId) return;
    function onVisible() {
      if (document.visibilityState === 'visible') refreshCart();
    }
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [userId, refreshCart]);

  // Signed out: update the screen and the localStorage notebook together
  function updateGuestCart(change: (prev: CartItem[]) => CartItem[]) {
    setItems((prev) => {
      const next = change(prev);
      saveCartToStorage(next);
      return next;
    });
  }

  // Add a product to the cart (or increase quantity if already there)
  function addItem(product: Product, quantity = 1) {
    if (!userId) {
      updateGuestCart((prev) => withAdded(prev, product, quantity));
      return;
    }
    // Update the screen straight away, then save and re-load the real cart
    setItems((prev) => withAdded(prev, product, quantity));
    addToRemoteCart(product.id, quantity).then(refreshCart);
  }

  // Remove a product entirely from the cart
  function removeItem(productId: string) {
    const change = (prev: CartItem[]) => prev.filter((item) => item.product.id !== productId);
    if (!userId) {
      updateGuestCart(change);
      return;
    }
    setItems(change);
    removeFromRemoteCart(productId).then(refreshCart);
  }

  // Update the quantity of a specific product
  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    if (!userId) {
      updateGuestCart((prev) => withQuantity(prev, productId, quantity));
      return;
    }
    const item = items.find((i) => i.product.id === productId);
    // The database allows at most 99 of one product
    const capped = Math.min(quantity, item?.product.stock_quantity ?? quantity, 99);
    setItems((prev) => withQuantity(prev, productId, quantity));
    setRemoteCartQuantity(productId, capped).then(refreshCart);
  }

  // Clear the entire cart
  function clearCart() {
    if (!userId) {
      updateGuestCart(() => []);
      return;
    }
    setItems([]);
    clearRemoteCart().then(refreshCart);
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
