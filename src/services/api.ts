import { supabase } from '../lib/supabase';
import type { Category, Product } from '../types';

/**
 * Fetch all active categories, ordered by their sort_order.
 */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetch all active products.
 */
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Map the joined category name into the product object for easier UI usage
  return (data || []).map((product: any) => ({
    ...product,
    category_name: product.categories?.name,
  }));
}

/**
 * Fetch a single product by its slug.
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single(); // .single() tells Supabase we expect exactly one row

  if (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return null;
  }

  if (data) {
    data.category_name = data.categories?.name;
  }
  return data;
}

/**
 * Fetch featured products.
 */
export async function fetchFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(4);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return (data || []).map((product: any) => ({
    ...product,
    category_name: product.categories?.name,
  }));
}
