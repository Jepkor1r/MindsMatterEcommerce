/*
 * All the Supabase queries the app makes.
 * These use the SAME tables and function as the website:
 *   - products            (public list of products)
 *   - cart_items          (the signed-in user's cart, protected by Row Level Security)
 *   - add_to_cart()       (adds to the quantity, capped at stock — see supabase/cart.sql)
 * Every function throws an Error with a friendly message if something goes wrong.
 */
import { supabase } from './supabase';

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  currency: string;
  cover_image: string | null;
  stock_quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Product images are stored as website paths like "/images/book.png" (they live in the
// website's public/ folder). A browser fills in the website address by itself; the app
// can't, so we add it here.
const WEBSITE_URL = (process.env.EXPO_PUBLIC_WEBSITE_URL || 'https://minds-matter-ecommerce.vercel.app').replace(/\/$/, '');

function fullImageUrl(path: string | null): string | null {
  if (!path) return null;
  return path.startsWith('/') ? WEBSITE_URL + path : path;
}

/** Tidy up a product row from Supabase: price as a number, full image URL. */
function toProduct(row: any): Product {
  return { ...row, price: Number(row.price), cover_image: fullImageUrl(row.cover_image) };
}

const PRODUCT_FIELDS = 'id, name, slug, short_description, price, currency, cover_image, stock_quantity';

/** All products that are for sale. */
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_FIELDS)
    .eq('is_active', true)
    .order('name');
  if (error) {
    console.error('Error loading products:', error);
    throw new Error('Could not load products. Check your internet connection.');
  }
  return (data || []).map(toProduct);
}

/** The signed-in user's cart (RLS makes sure we only get our own rows). */
export async function fetchCart(): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`quantity, products (${PRODUCT_FIELDS}, is_active)`)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error loading cart:', error);
    throw new Error('Could not load your cart. Pull down to try again.');
  }
  return (data || [])
    .filter((row: any) => row.products && row.products.is_active)
    .map((row: any) => ({
      product: toProduct(row.products),
      quantity: row.quantity,
    }));
}

/** Add some of a product to the cart (adds to what's already there). */
export async function addToCart(productId: string, quantity = 1): Promise<void> {
  const { error } = await supabase.rpc('add_to_cart', {
    p_product_id: productId,
    p_quantity: quantity,
  });
  if (error) {
    console.error('Error adding to cart:', error);
    // Messages from add_to_cart() are already friendly (e.g. "This product is out of stock")
    throw new Error(error.message || 'Could not add to cart.');
  }
}

/** Set the exact quantity of a product already in the cart (1–99). */
export async function setCartQuantity(productId: string, quantity: number): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('product_id', productId);
  if (error) {
    console.error('Error updating quantity:', error);
    throw new Error('Could not update the quantity.');
  }
}

/** Remove a product from the cart. */
export async function removeFromCart(productId: string): Promise<void> {
  const { error } = await supabase.from('cart_items').delete().eq('product_id', productId);
  if (error) {
    console.error('Error removing item:', error);
    throw new Error('Could not remove the item.');
  }
}
