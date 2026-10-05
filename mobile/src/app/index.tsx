/*
 * SHOP SCREEN — the product list.
 * Products come from the same Supabase `products` table as the website.
 * "Add to Cart" saves straight into the user's cart in Supabase, so the
 * website sees it too.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { addToCart, fetchProducts, type Product } from '../lib/api';
import { useAuth } from '../lib/auth';
import { colors, formatCurrency } from '../lib/theme';

export default function ShopScreen() {
  const { session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Which product is being added right now, and a short message after adding
  const [addingId, setAddingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setProducts(await fetchProducts());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleAdd(product: Product) {
    setAddingId(product.id);
    setMessage(null);
    try {
      await addToCart(product.id, 1);
      setMessage(`✓ ${product.name} added to your cart`);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setAddingId(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading products…</Text>
      </View>
    );
  }

  const firstName = session?.user.user_metadata?.full_name?.split(' ')[0];

  return (
    <View style={{ flex: 1 }}>
      {message && <Text style={styles.toast}>{message}</Text>}
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.muted}>
              Signed in as {firstName ? `${firstName} (${session?.user.email})` : session?.user.email}
            </Text>
            {error && <Text style={styles.error}>{error}</Text>}
          </View>
        }
        ListEmptyComponent={!error ? <Text style={styles.muted}>No products yet.</Text> : null}
        renderItem={({ item }) => {
          const inStock = item.stock_quantity > 0;
          const adding = addingId === item.id;
          return (
            <View style={styles.card}>
              {item.cover_image ? (
                <Image source={{ uri: item.cover_image }} style={styles.image} />
              ) : (
                <View style={styles.image} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                {item.short_description && (
                  <Text style={styles.muted} numberOfLines={2}>{item.short_description}</Text>
                )}
                <Text style={styles.price}>{formatCurrency(item.price, item.currency)}</Text>
                <Pressable
                  style={[styles.button, (!inStock || adding) && { opacity: 0.5 }]}
                  onPress={() => handleAdd(item)}
                  disabled={!inStock || adding}
                >
                  <Text style={styles.buttonText}>
                    {!inStock ? 'Out of stock' : adding ? 'Adding…' : 'Add to Cart'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  muted: { color: colors.muted },
  error: { color: colors.error, backgroundColor: colors.errorLight, padding: 10, borderRadius: 8, marginTop: 8 },
  toast: {
    backgroundColor: colors.sage,
    color: colors.white,
    padding: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  image: { width: 90, height: 110, borderRadius: 10, backgroundColor: colors.blush },
  name: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginBottom: 2 },
  price: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 6 },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: colors.white, fontWeight: '700' },
});
