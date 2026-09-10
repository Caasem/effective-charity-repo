/**
 * Effective Charity — Design System
 *
 * Fusion brief:
 *  - Revolut: dark canvas, saturated single accent, huge confident numerals,
 *    snappy motion, everything feels "live" and immediate.
 *  - Fortify.qa: restraint, authority, generous whitespace, declarative
 *    headlines ("Resilience, engineered."), minimal iconography, trust
 *    signalled through precision rather than decoration.
 *
 * Net result: urgent but not noisy. Every screen should feel like it is
 * reporting live facts about real human need, not "browsing a catalog."
 */

export const color = {
  // Base canvas — near-black, slightly warm (not pure #000, feels less cold)
  bg: '#0A0B0D',
  bgElevated: '#121317',
  bgCard: '#17181D',
  bgCardPressed: '#1E2026',
  border: '#26282F',
  borderSubtle: '#1B1D22',

  // Text
  textPrimary: '#F5F6F7',
  textSecondary: '#9A9DA6',
  textTertiary: '#65686F',
  textInverse: '#0A0B0D',

  // Brand accent — deep emerald (Islamic-giving association, but rendered
  // as a fintech "signal" color, not a decorative green)
  accent: '#00D68F',
  accentDim: '#0A3B2C',
  accentPressed: '#00B87A',

  // Urgency scale — this is the "immediate" language of the app.
  // Used on progress bars, badges, need-gap indicators.
  urgencyCritical: '#FF4757',
  urgencyCriticalDim: '#3A1418',
  urgencyHigh: '#FF9F43',
  urgencyHighDim: '#3A2A12',
  urgencyMedium: '#FFD93D',
  urgencyMediumDim: '#3A340F',
  urgencyLow: '#54A0FF',
  urgencyLowDim: '#12233F',

  // Semantic
  success: '#00D68F',
  danger: '#FF4757',
  warning: '#FF9F43',
  info: '#54A0FF',

  // Verification / trust marker (Fortify-style badge)
  verified: '#54A0FF',
  verifiedDim: '#12233F',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(6,7,9,0.72)',
} as const;

export const gradient = {
  hero: ['#0A0B0D', '#121A16', '#0A0B0D'] as const,
  accent: ['#00D68F', '#00B87A'] as const,
  critical: ['#FF4757', '#C0392B'] as const,
  card: ['#17181D', '#121317'] as const,
};

export const type = {
  // Fortify-style: bold, declarative, tight tracking on display sizes.
  display: { fontSize: 40, lineHeight: 44, fontWeight: '800' as const, letterSpacing: -1 },
  h1: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const, letterSpacing: -0.6 },
  h2: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const, letterSpacing: -0.4 },
  h3: { fontSize: 19, lineHeight: 24, fontWeight: '700' as const, letterSpacing: -0.2 },
  bodyLg: { fontSize: 17, lineHeight: 24, fontWeight: '400' as const },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, lineHeight: 21, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 17, fontWeight: '500' as const },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.6 },
  // Revolut-style giant numerals for money/impact figures
  statHuge: { fontSize: 52, lineHeight: 54, fontWeight: '800' as const, letterSpacing: -1.5 },
  statLg: { fontSize: 28, lineHeight: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: color.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
};

export function urgencyColor(level: 'critical' | 'high' | 'medium' | 'low') {
  switch (level) {
    case 'critical':
      return { fg: color.urgencyCritical, bg: color.urgencyCriticalDim };
    case 'high':
      return { fg: color.urgencyHigh, bg: color.urgencyHighDim };
    case 'medium':
      return { fg: color.urgencyMedium, bg: color.urgencyMediumDim };
    case 'low':
    default:
      return { fg: color.urgencyLow, bg: color.urgencyLowDim };
  }
}

export const motion = {
  fast: 140,
  base: 220,
  slow: 340,
};
