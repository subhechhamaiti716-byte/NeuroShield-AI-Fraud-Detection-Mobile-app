import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Animated, ScrollView,
  ActivityIndicator, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, FONT } from '../constants/theme';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  // Password strength
  const getPasswordStrength = () => {
    if (password.length === 0) return { label: '', color: 'transparent', width: '0%' };
    if (password.length < 6) return { label: 'Weak', color: COLORS.danger, width: '25%' };
    if (password.length < 10) return { label: 'Medium', color: COLORS.warning, width: '50%' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password))
      return { label: 'Strong', color: COLORS.success, width: '100%' };
    return { label: 'Good', color: COLORS.primary, width: '75%' };
  };

  const strength = getPasswordStrength();

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await signup(email, password, fullName);
      if (!result.success) {
        setError(result.error || 'Signup failed');
      }
    } catch (e) {
      setError(e.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon, placeholder, value, onChangeText, secure, keyboardType, extra }) => (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color={COLORS.textMuted} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure && !showPassword}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
      {extra}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.bgCircle1} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.content}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Header */}
            <View style={styles.headerRow}>
              <LinearGradient
                colors={['#1A2980', '#26D0CE']}
                style={styles.shieldSmall}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="shield-checkmark" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.appName}>NeuroShield</Text>
            </View>

            <Text style={styles.heading}>Create Your Secure Account</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <InputField icon="person-outline" placeholder="Full Name" value={fullName} onChangeText={setFullName} />
            <InputField icon="mail-outline" placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <InputField icon="call-outline" placeholder="+1 (555) 000-0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

            <InputField
              icon="lock-closed-outline"
              placeholder="Create Password"
              value={password}
              onChangeText={setPassword}
              secure
              extra={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              }
            />

            {/* Password Strength */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarBg}>
                  <View style={[styles.strengthBarFill, { width: strength.width, backgroundColor: strength.color }]} />
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
              </View>
            )}

            <InputField
              icon="lock-open-outline"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secure
            />

            {/* Terms */}
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Signup Button */}
            <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.8}>
              <LinearGradient
                colors={COLORS.gradientBlue}
                style={styles.signupBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signupBtnText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bgCircle1: {
    position: 'absolute', top: -80, right: -60, width: 200, height: 200,
    borderRadius: 100, backgroundColor: 'rgba(0,210,255,0.04)',
  },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: SPACING.xxl },
  content: { paddingHorizontal: SPACING.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  shieldSmall: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  appName: { ...FONT.bold, fontSize: 20 },
  heading: { ...FONT.heading, fontSize: 24, marginBottom: SPACING.lg },
  errorContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.dangerGlow,
    borderRadius: 10, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,75,75,0.2)',
  },
  errorText: { color: COLORS.danger, marginLeft: SPACING.sm, fontSize: 13 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgInput,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SPACING.md, paddingHorizontal: SPACING.md, height: 54,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  eyeBtn: { padding: SPACING.xs },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, marginTop: -SPACING.sm },
  strengthBarBg: { flex: 1, height: 4, backgroundColor: COLORS.bgInput, borderRadius: 2, marginRight: SPACING.sm },
  strengthBarFill: { height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '600' },
  termsText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 20 },
  termsLink: { color: COLORS.primary },
  signupBtn: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  signupBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
