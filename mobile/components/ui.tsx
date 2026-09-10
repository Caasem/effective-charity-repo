import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { color, type, space, radius, shadow, urgencyColor } from '../lib/theme';

/* ---------------------------------------------------------------------- */
/* Card                                                                    */
/* ---------------------------------------------------------------------- */

export function Card({
  children,
  style,
  onPress,
  elevated = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const content = (
    <Animated.View
      style={[
        styles.card,
        elevated && shadow.card,
        style,
        { transform: [{ scale }] },
      ]}
    >
      {children}
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 40 }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()
      }
    >
      {content}
    </Pressable>
  );
}

/* ---------------------------------------------------------------------- */
/* Badge                                                                   */
/* ---------------------------------------------------------------------- */

export function UrgencyBadge({ level }: { level: 'critical' | 'high' | 'medium' | 'low' }) {
  const c = urgencyColor(level);
  const label = level === 'critical' ? 'CRITICAL' : level.toUpperCase();
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.fg }]} />
      <Text style={[type.micro, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

export function VerifiedBadge({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.badge, { backgroundColor: color.verifiedDim }]}>
      <Text style={{ color: color.verified, fontSize: small ? 10 : 12 }}>✓</Text>
      {!small && <Text style={[type.micro, { color: color.verified }]}>VERIFIED</Text>}
    </View>
  );
}

export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        active
          ? { backgroundColor: color.accent }
          : { backgroundColor: color.bgCard, borderWidth: 1, borderColor: color.border },
      ]}
    >
      <Text
        style={[
          type.bodyMedium,
          { color: active ? color.textInverse : color.textSecondary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------------------------------------------------------------------- */
/* Progress                                                                */
/* ---------------------------------------------------------------------- */

export function ProgressBar({
  percent,
  color: barColor = color.accent,
  height = 8,
}: {
  percent: number;
  color?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={[styles.progressTrack, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${clamped}%`,
            backgroundColor: barColor,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

/* ---------------------------------------------------------------------- */
/* Button                                                                  */
/* ---------------------------------------------------------------------- */

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  icon,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'lg' | 'md';
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const bg =
    variant === 'primary'
      ? color.accent
      : variant === 'danger'
      ? color.urgencyCritical
      : variant === 'secondary'
      ? color.bgCard
      : 'transparent';
  const fg =
    variant === 'primary' || variant === 'danger' ? color.textInverse : color.textPrimary;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start()
        }
        style={[
          styles.button,
          size === 'lg' ? styles.buttonLg : styles.buttonMd,
          { backgroundColor: bg, opacity: disabled ? 0.4 : 1 },
          variant === 'secondary' && { borderWidth: 1, borderColor: color.border },
        ]}
      >
        {icon}
        <Text style={[type.bodyMedium, { color: fg, fontSize: size === 'lg' ? 16 : 14 }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/* ---------------------------------------------------------------------- */
/* Stat figure — Revolut-style giant numeral                              */
/* ---------------------------------------------------------------------- */

export function StatFigure({
  value,
  label,
  huge = false,
}: {
  value: string;
  label: string;
  huge?: boolean;
}) {
  return (
    <View>
      <Text style={[huge ? type.statHuge : type.statLg, { color: color.textPrimary }]}>
        {value}
      </Text>
      <Text style={[type.caption, { color: color.textTertiary, marginTop: 2 }]}>{label}</Text>
    </View>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[type.h3, { color: color.textPrimary }]}>{title}</Text>
      {action && (
        <Pressable onPress={onAction}>
          <Text style={[type.bodyMedium, { color: color.accent }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    padding: space.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: space.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pill: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
  },
  progressTrack: {
    backgroundColor: color.bgElevated,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    minWidth: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderRadius: radius.md,
  },
  buttonLg: {
    height: 56,
    paddingHorizontal: space.xl,
  },
  buttonMd: {
    height: 44,
    paddingHorizontal: space.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: color.border,
    marginVertical: space.lg,
  },
});
