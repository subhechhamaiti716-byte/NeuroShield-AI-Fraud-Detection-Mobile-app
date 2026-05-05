import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFraudAlert } from '../hooks/useFraudAlert';
import { getAnalytics, getTransactions } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  useFraudAlert(navigation); // Start listening for alerts
  const [data, setData] = useState({ total_balance: 0, total_spent: 0, fraud_risk_level: 'Low' });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [analyticsRes, transactionsRes] = await Promise.all([
        getAnalytics(),
        getTransactions()
      ]);
      setData(analyticsRes.data);
      setRecentTransactions(transactionsRes.data.slice(0, 5));
    } catch (error) {
      console.log('Error fetching dashboard data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <LinearGradient colors={[COLORS.background, '#1A1A25']} style={styles.header}>
        <Text style={styles.welcome}>Hello, {user?.email?.split('@')[0] || 'User'}</Text>
        <Text style={styles.subtitle}>Your security is our priority</Text>
      </LinearGradient>

      <View style={styles.balanceCard}>
        <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.cardGradient}>
          <Text style={styles.balanceLabel}>Total Protected Balance</Text>
          <Text style={styles.balanceAmount}>₹{data.total_balance.toLocaleString()}</Text>
          <View style={styles.riskBadge}>
            <Text style={[styles.riskText, { color: data.fraud_risk_level === 'Low' ? '#4ADE80' : '#FACC15' }]}>
              RISK LEVEL: {data.fraud_risk_level.toUpperCase()}
            </Text>
          </View>
        </LinearGradient>
      </View>
      
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {recentTransactions.map(item => (
          <View key={item.id} style={styles.miniCard}>
            <View style={[styles.miniIcon, { backgroundColor: item.is_fraud && item.status !== 'confirmed_safe' ? COLORS.dangerGlow : COLORS.bgElevated }]}>
              <Ionicons 
                name={item.is_fraud && item.status !== 'confirmed_safe' ? "warning" : "receipt-outline"} 
                size={18} 
                color={item.is_fraud && item.status !== 'confirmed_safe' ? COLORS.danger : COLORS.primary} 
              />
            </View>
            <View style={styles.miniInfo}>
              <Text style={styles.miniMerchant}>{item.location}</Text>
              <Text style={styles.miniMeta}>{item.category}</Text>
            </View>
            <Text style={[styles.miniAmount, { color: item.is_fraud && item.status !== 'confirmed_safe' ? COLORS.danger : COLORS.text }]}>
              ₹{item.amount.toLocaleString()}
            </Text>
          </View>
        ))}
        {recentTransactions.length === 0 && (
          <Text style={styles.emptyText}>No recent transactions</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.xl, paddingTop: 60 },
  welcome: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  balanceCard: { margin: SPACING.l, height: 180, marginTop: -20 },
  cardGradient: { flex: 1, borderRadius: 24, padding: SPACING.xl, justifyContent: 'center' },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  balanceAmount: { color: '#FFF', fontSize: 32, fontWeight: '800', marginTop: 8 },
  riskBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 16 },
  riskText: { fontSize: 10, fontWeight: '800' },
  recentSection: { paddingHorizontal: SPACING.l, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.m },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  miniCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  miniIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  miniInfo: { flex: 1, marginLeft: 12 },
  miniMerchant: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  miniMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  miniAmount: { fontSize: 14, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 20, fontSize: 14 },
});
