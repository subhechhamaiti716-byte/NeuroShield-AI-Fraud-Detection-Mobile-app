import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { COLORS, SPACING, FONT } from '../constants/theme';

const CATEGORIES = ['Shopping', 'Food & Drink', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Travel'];

export default function AddTransactionScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Expense'); // Income or Expense
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setGeoLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to help detect fraud.');
        setGeoLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      let reverse = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });
      
      setLocation({
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
        place: reverse[0]?.city || reverse[0]?.region || 'Unknown Location'
      });
      setGeoLoading(false);
    })();
  }, []);

  const handleAddTransaction = async () => {
    if (!amount || isNaN(amount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        amount: parseFloat(amount),
        type: type,
        category: category,
        location: location?.place || 'Manual Entry',
        latitude: location?.lat || 0.0,
        longitude: location?.lon || 0.0,
        device_id: Device.osBuildId || 'unknown-device',
        device_model: Device.modelName || 'Unknown Device',
        os_version: `${Device.osName} ${Device.osVersion}`
      };

      const result = await api.createTransaction(transactionData);
      
      if (result.data.is_fraud) {
        // The WebSocket on Dashboard will catch this, but we can also show a local alert
        navigation.goBack();
      } else {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to process transaction');
    } finally {
      setLoading(false);
    }
  };

  const simulateSMSParsing = () => {
    setGeoLoading(true);
    // Simulated SMS content common in India
    const mockSMS = "HDFC Bank: Rs 2450.00 debited from a/c **1234 on 05-MAY-26. Info: POS SWIGGY. Call 1800... if not you.";
    
    // Simple regex for amount
    const amountMatch = mockSMS.match(/Rs\s*([\d.]+)/i) || mockSMS.match(/₹\s*([\d.]+)/i);
    if (amountMatch) {
      setAmount(amountMatch[1]);
    }
    
    // Auto-select category if info matches
    if (mockSMS.toLowerCase().includes('swiggy') || mockSMS.toLowerCase().includes('zomato')) {
      setCategory('Food & Drink');
    }

    setTimeout(() => {
      setGeoLoading(false);
      Alert.alert("SMS Parsed", "Transaction details extracted from simulated SMS.");
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Transaction</Text>
        <TouchableOpacity onPress={simulateSMSParsing} style={styles.smsBtn}>
          <Ionicons name="mail-unread-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.amountSection}>
            <Text style={styles.label}>Enter Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currency}>₹</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Type</Text>
            <View style={styles.typeContainer}>
              {['Expense', 'Income'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Current Location</Text>
                {geoLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} style={{ alignSelf: 'flex-start' }} />
                ) : (
                  <Text style={styles.infoValue}>{location?.place || 'Detecting...'}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="phone-portrait-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Device Info</Text>
                <Text style={styles.infoValue}>{Device.modelName || 'Generic Phone'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.disclaimer}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
            <Text style={styles.disclaimerText}>AI Fraud Check Enabled</Text>
          </View>

          <TouchableOpacity
            onPress={handleAddTransaction}
            disabled={loading}
            activeOpacity={0.8}
            style={styles.submitBtn}
          >
            <LinearGradient
              colors={COLORS.gradientBlue}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Add Transaction</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 18,
  },
  smsBtn: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  amountSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  label: {
    ...FONT.caption,
    marginBottom: SPACING.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    ...FONT.hero,
    color: COLORS.primary,
    marginRight: 4,
  },
  amountInput: {
    ...FONT.hero,
    fontSize: 48,
    minWidth: 100,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...FONT.bold,
    fontSize: 16,
    marginBottom: SPACING.md,
  },
  categoryScroll: {
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primary,
  },
  categoryText: {
    ...FONT.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.primary,
  },
  infoSection: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgInput,
    borderRadius: 14,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  typeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  typeBtnText: {
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#fff',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    marginLeft: SPACING.md,
  },
  infoLabel: {
    ...FONT.caption,
    fontSize: 11,
  },
  infoValue: {
    ...FONT.medium,
    fontSize: 14,
    marginTop: 2,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: 6,
  },
  disclaimerText: {
    ...FONT.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
