import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { COLORS, SPACING, FONT } from '../constants/theme';

export default function TransactionHistoryScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  const fetchTransactions = async () => {
    try {
      const response = await api.getTransactions();
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'All') return true;
    return t.type === filter;
  });

  const renderItem = ({ item }) => {
    const isRisky = (item.is_fraud || item.status === 'suspicious' || item.status === 'confirmed_fraud') && item.status !== 'confirmed_safe';
    const statusColor = isRisky ? COLORS.danger : COLORS.success;
    const statusBg = isRisky ? COLORS.dangerGlow : COLORS.successGlow;

    return (
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: isRisky ? COLORS.dangerGlow : COLORS.bgElevated }]}>
          <Ionicons 
            name={isRisky ? "warning" : "receipt-outline"} 
            size={22} 
            color={isRisky ? COLORS.danger : COLORS.primary} 
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.merchant}>{item.location}</Text>
          <Text style={styles.meta}>{item.category} • {new Date(item.timestamp).toLocaleDateString()}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: isRisky ? COLORS.danger : COLORS.textPrimary }]}>
            ₹{item.amount.toLocaleString()}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.filterContainer}>
        {['All', 'Income', 'Expense'].map(f => (
          <TouchableOpacity 
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="documents-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    ...FONT.bold,
    fontSize: 20,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    ...FONT.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  merchant: {
    ...FONT.bold,
    fontSize: 15,
  },
  meta: {
    ...FONT.caption,
    fontSize: 12,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    ...FONT.bold,
    fontSize: 15,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    ...FONT.caption,
    marginTop: SPACING.sm,
  },
});
