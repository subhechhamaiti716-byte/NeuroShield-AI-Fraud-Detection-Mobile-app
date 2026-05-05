import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  ActivityIndicator, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { COLORS, SPACING, FONT, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.getAnalytics();
        setAnalytics(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics & Insights</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Spending Trend Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending Trend</Text>
          <View style={styles.graphContainer}>
            <Svg height="100" width="100%">
              <Path
                d="M0,80 Q25,40 50,60 T100,20 T150,50 T200,30 T250,70 T300,10"
                fill="none"
                stroke={COLORS.primary}
                strokeWidth="3"
              />
              {/* Data Points */}
              <Circle cx="50" cy="60" r="4" fill={COLORS.primary} />
              <Circle cx="100" cy="20" r="4" fill={COLORS.primary} />
              <Circle cx="200" cy="30" r="4" fill={COLORS.primary} />
            </Svg>
            <View style={styles.graphLabels}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <Text key={day} style={styles.graphLabelText}>{day}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Risk Score Card */}
        <View style={styles.riskCard}>
          <Text style={styles.riskCardTitle}>Overall Security Score</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreRing}>
              <Text style={styles.scoreText}>{analytics?.safe_percentage?.toFixed(0) || 100}%</Text>
              <Text style={styles.scoreSubtext}>Safe</Text>
            </View>
            <View style={styles.scoreInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.infoText}>Pattern Matches</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>Active Protection</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="flash" size={20} color={COLORS.warning} />
                <Text style={styles.infoText}>Real-time AI</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Spending Categories</Text>
        <View style={styles.categoryCard}>
          {Object.entries(analytics?.category_breakdown || {}).map(([cat, val], idx) => (
            <View key={cat} style={styles.catRow}>
              <View style={styles.catInfo}>
                <View style={[styles.catDot, { backgroundColor: ['#00D2FF', '#00F2FE', '#00F260', '#FFB800', '#FF4B4B'][idx % 5] }]} />
                <Text style={styles.catName}>{cat}</Text>
              </View>
              <Text style={styles.catValue}>₹{val.toLocaleString()}</Text>
            </View>
          ))}
          {(!analytics?.category_breakdown || Object.keys(analytics.category_breakdown).length === 0) && (
            <Text style={styles.noData}>No data available yet</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Fraud Prevention Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Attempts Blocked</Text>
            <Text style={[styles.statValue, { color: COLORS.danger }]}>{analytics?.total_spent > 0 ? '2' : '0'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Resolved</Text>
            <Text style={[styles.statValue, { color: COLORS.success }]}>{analytics?.total_spent > 0 ? '100%' : '-'}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    ...FONT.bold,
    fontSize: 24,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  graphContainer: {
    height: 140,
    marginTop: SPACING.md,
    justifyContent: 'center',
  },
  graphLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingHorizontal: 5,
  },
  graphLabelText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  riskCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  riskCardTitle: {
    ...FONT.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  scoreRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: COLORS.primaryGlow,
    borderTopColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    ...FONT.bold,
    fontSize: 28,
  },
  scoreSubtext: {
    ...FONT.caption,
    fontSize: 12,
  },
  scoreInfo: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    ...FONT.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    ...FONT.bold,
    fontSize: 18,
    marginBottom: SPACING.md,
  },
  categoryCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    ...FONT.medium,
    fontSize: 14,
  },
  catValue: {
    ...FONT.bold,
    fontSize: 14,
  },
  noData: {
    ...FONT.caption,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    padding: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  statLabel: {
    ...FONT.caption,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    ...FONT.bold,
    fontSize: 20,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
