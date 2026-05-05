import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { COLORS, SPACING, FONT, SHADOWS } from '../constants/theme';

const { height } = Dimensions.get('window');

export default function SuspiciousAlertScreen({ route, navigation }) {
  const { transaction } = route.params;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFeedback = async (feedback) => {
    try {
      await api.sendFeedback(transaction.transaction_id, feedback);
      closeAlert();
    } catch (error) {
      console.error('Error sending feedback:', error);
      closeAlert();
    }
  };

  const closeAlert = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => navigation.goBack());
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
      
      <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <View style={styles.warningIconContainer}>
            <Ionicons name="warning" size={32} color={COLORS.danger} />
          </View>
          <Text style={styles.title}>Suspicious Transaction Detected</Text>
          <Text style={styles.subtitle}>We noticed an unusual attempt on your account. Was this you?</Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.merchantIcon}>
              <Ionicons name="cart" size={24} color={COLORS.textPrimary} />
            </View>
            <View style={styles.merchantInfo}>
              <Text style={styles.merchantName}>{transaction.location || 'Unknown Merchant'}</Text>
              <Text style={styles.transactionMeta}>{transaction.time} • Local Device</Text>
            </View>
            <Text style={styles.amount}>₹{transaction.amount?.toLocaleString()}</Text>
          </View>
          
          <View style={styles.riskBarContainer}>
            <View style={styles.riskBarInfo}>
              <Text style={styles.riskLabel}>Fraud Risk Score</Text>
              <Text style={styles.riskValue}>{(transaction.score * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${transaction.score * 100}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.yesBtn}
            onPress={() => handleFeedback('YES')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradientBlue}
              style={styles.btnGradient}
            >
              <Text style={styles.yesBtnText}>Yes, It's Me</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.noBtn}
            onPress={() => handleFeedback('NO')}
            activeOpacity={0.7}
          >
            <Text style={styles.noBtnText}>No, Report Fraud</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  modal: {
    backgroundColor: COLORS.bgElevated,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: SPACING.xl,
    paddingBottom: 50,
    ...SHADOWS.card,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.dangerGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...FONT.bold,
    fontSize: 22,
    textAlign: 'center',
  },
  subtitle: {
    ...FONT.caption,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  merchantIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  merchantName: {
    ...FONT.bold,
    fontSize: 16,
  },
  transactionMeta: {
    ...FONT.caption,
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    ...FONT.bold,
    fontSize: 18,
    color: COLORS.danger,
  },
  riskBarContainer: {
    marginTop: SPACING.sm,
  },
  riskBarInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  riskLabel: {
    ...FONT.caption,
    fontSize: 12,
  },
  riskValue: {
    ...FONT.bold,
    fontSize: 12,
    color: COLORS.danger,
  },
  barBg: {
    height: 6,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.danger,
    borderRadius: 3,
  },
  actions: {
    gap: SPACING.md,
  },
  yesBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.glow(COLORS.primary),
  },
  btnGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  noBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBtnText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
