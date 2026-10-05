/*
 * CART SCREEN — the signed-in user's cart from Supabase `cart_items`.
 * It re-loads EVERY time you open this tab (useFocusEffect), and you can
 * pull down to refresh, so items added on the website appear straight away.
 */
import { useCallback, useState } from 'react';
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
import { useFocusEffect } from 'expo-router';
import { fetchCart, removeFromCart, setCartQuantity, type CartItem } from '../lib/api';
import { colors, formatCurrency } from '../lib/theme';

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null); // item being changed right now

  const load = useCallback(async () => {
    try {
      setError(null);
      setItems(await fetchCart());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  // Runs every time the Cart tab comes into view
  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  // Change quantity (or remove when it would go to 0), then re-load from Supabase
  async function changeQuantity(item: CartItem, newQuantity: number) {
    setBusyId(item.product.id);
    try {
      if (newQuantity <= 0) {
        await removeFromCart(item.product.id);
      } else {
        const capped = Math.min(newQuantity, item.product.stock_quantity, 99);
        await setCartQuantity(item.product.id, capped);
      }
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Loading your cart…</Text>
      </View>
    );
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.product.id}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.muted}>Add something from the Shop tab or the website.</Text>
            <Text style={styles.muted}>Pull down to refresh.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const busy = busyId === item.product.id;
          return (
            <View style={[styles.card, busy && { opacity: 0.5 }]}>
              {item.product.cover_image ? (
                <Image source={{ uri: item.product.cover_image }} style={styles.image} />
              ) : (
                <View style={styles.image} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
                <Text style={styles.muted}>
                  {formatCurrency(item.product.price, item.product.currency)} each
                </Text>
                <View style={styles.row}>
                  <Pressable
                    style={styles.qtyButton}
                    disabled={busy}
                    onPress={() => changeQuantity(item, item.quantity - 1)}
                  >
                    <Text style={styles.qtyText}>−</Text>
                  </Pressable>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <Pressable
                    style={styles.qtyButton}
                    disabled={busy || item.quantity >= item.product.stock_quantity}
                    onPress={() => changeQuantity(item, item.quantity + 1)}
                  >
                    <Text style={styles.qtyText}>+</Text>
                  </Pressable>
                  <Pressable disabled={busy} onPress={() => changeQuantity(item, 0)} style={{ marginLeft: 'auto' }}>
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                </View>
                <Text style={styles.lineTotal}>
                  {formatCurrency(item.product.price * item.quantity, item.product.currency)}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.muted}>
            {itemCount} item{itemCount === 1 ? '' : 's'} · shipping and checkout on the website
          </Text>
          <Text style={styles.total}>Subtotal: {formatCurrency(subtotal)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  muted: { color: colors.muted, textAlign: 'left' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.primary },
  error: { color: colors.error, backgroundColor: colors.errorLight, padding: 10, borderRadius: 8 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  image: { width: 70, height: 90, borderRadius: 10, backgroundColor: colors.blush },
  name: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  qty: { fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center', color: colors.charcoal },
  remove: { color: colors.error, fontWeight: '600' },
  lineTotal: { fontWeight: '700', color: colors.primary, marginTop: 6 },
  footer: {
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 16,
    gap: 4,
  },
  total: { fontSize: 18, fontWeight: '700', color: colors.primary },
});
