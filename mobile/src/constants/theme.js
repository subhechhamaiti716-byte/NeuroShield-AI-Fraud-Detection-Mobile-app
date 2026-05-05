export const COLORS = {
  primary: '#00D2FF',
  secondary: '#00F2FE',
  accent: '#7000FF',
  background: '#0A0A0F',
  bg: '#0A0A0F',
  bgCard: '#12121A',
  bgElevated: '#1A1A24',
  bgInput: '#1A1A24',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B5',
  textMuted: '#8E8E93',
  success: '#4ADE80',
  warning: '#FACC15',
  danger: '#FF4B4B',
  dangerGlow: 'rgba(255, 75, 75, 0.15)',
  successGlow: 'rgba(74, 222, 128, 0.15)',
  primaryGlow: 'rgba(0, 210, 255, 0.15)',
  white: '#FFFFFF',
  black: '#000000',
  glass: 'rgba(255, 255, 255, 0.05)',
  gradientPrimary: ['#00D2FF', '#00F2FE'],
  gradientBlue: ['#00D2FF', '#00F2FE'],
  gradientSecurity: ['#1A2980', '#26D0CE'],
  gradientDanger: ['#FF4B4B', '#820000'],
};

export const SPACING = {
  xs: 4,
  s: 8,
  sm: 12,
  md: 16,
  m: 16,
  lg: 24,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const FONT = {
  bold: { fontWeight: '700' },
  semiBold: { fontWeight: '600' },
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  heading: { fontSize: 28, fontWeight: '800' },
  caption: { fontSize: 12, fontWeight: '400', color: '#8E8E93' },
  hero: { fontSize: 40, fontWeight: '900' }
};

export const SHADOWS = {
  glow: (color) => ({
    shadowColor: color || '#00D2FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  }),
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  }
};
