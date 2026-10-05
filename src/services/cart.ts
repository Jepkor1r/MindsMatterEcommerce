import { supabase } from '../lib/supabase';
import type { CartItem, Product } from '../types';

/*
 * Supabase queries for the signed-in user's cart (`cart_items` table, see supabase/cart.sql).
 * Row Level Security makes sure every query only ever touches the current user's rows.
 * The mobile app uses exactly the same table and add_to_cart() function.
 */

/**
 * Load the signed-in user's cart, with full product details.
 * Returns null if it could not be loaded (so the screen keeps what it had).
 */
export async function fetchRemoteCart(): Promise<CartItem[] | null> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity, products (*, categories (name))')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading cart:', error);
    return null;
  }

  return (data || [])
    .filter((row: any) => row.products && row.products.is_active)
    .map((row: any) => ({
      product: { ...row.products, category_name: row.products.categories?.name } as Product,
      quantity: row.quantity,
    }));
}

/** Add some of a product (adds to the existing quantity; capped at stock on the server). */
export async function addToRemoteCart(productId: string, quantity: number): Promise<void> {
  const { error } = await supabase.rpc('add_to_cart', {
    p_product_id: productId,
    p_quantity: quantity,
  });
  if (error) console.error('Error adding to cart:', error);
}

/** Set the exact quantity of a product that is already in the cart. */
export async function setRemoteCartQuantity(productId: string, quantity: number): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('product_id', productId);
  if (error) console.error('Error updating cart quantity:', error);
}

/** Remove one product from the cart. */
export async function removeFromRemoteCart(productId: string): Promise<void> {
  const { error } = await supabase.from('cart_items').delete().eq('product_id', productId);
  if (error) console.error('Error removing from cart:', error);
}

/** Empty the whole cart (e.g. after an order is placed). */
export async function clearRemoteCart(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return;
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (error) console.error('Error clearing cart:', error);
}
