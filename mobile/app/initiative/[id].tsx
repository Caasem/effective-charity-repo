import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { color, type, space, radius } from '../../lib/theme';
import { Card, UrgencyBadge, ProgressBar, Button, Divider, VerifiedBadge } from '../../components/ui';
import { initiatives, organisations, formatCurrency } from '../../data/mockData';
import { useInitiativeFunding } from '../../lib/store';

export default function InitiativeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const initiative = initiatives.find((i) => i.id === id);
  const raised = useInitiativeFunding(id ?? '');

  if (!initiative) return null;
  const org = organisations.find((o) => o.id === initiative.organisationId);
  const percent = Math.round((raised / initiative.fundingGoal) * 100);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.navRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={color.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.rowBetween}>
          <Text style={{ fontSize: 44 }}>{initiative.emoji}</Text>
          <UrgencyBadge level={initiative.urgency} />
        </View>

        <Text style={[type.h1, { color: color.textPrimary, marginTop: space.lg }]}>
          {initiative.title}
        </Text>
        <Text style={[type.body, { color: color.textTertiary, marginTop: 4 }]}>
          {initiative.location}, {initiative.country}
        </Text>

        <Text style={[type.body, { color: color.textSecondary, marginTop: space.lg }]}>
          {initiative.description}
        </Text>

        <Card style={{ marginTop: space.xl }}>
          <ProgressBar percent={percent} height={10} />
          <View style={[styles.rowBetween, { marginTop: space.md }]}>
            <View>
              <Text style={[type.statLg, { color: color.textPrimary }]}>{formatCurrency(raised)}</Text>
              <Text style={[type.caption, { color: color.textTertiary }]}>raised of {formatCurrency(initiative.fundingGoal)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[type.statLg, { color: color.textPrimary }]}>{percent}%</Text>
              <Text style={[type.caption, { color: color.textTertiary }]}>{initiative.donorCount.toLocaleString()} donors</Text>
            </View>
          </View>
        </Card>

        {org && (
          <Pressable onPress={() => router.push(`/charity/${org.id}`)}>
            <Card style={{ marginTop: space.lg }}>
              <View style={styles.row}>
                <View style={styles.logoCircle}>
                  <Text style={{ fontSize: 22 }}>{org.logo}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowBetween}>
                    <Text style={[type.bodyMedium, { color: color.textPrimary }]}>{org.name}</Text>
                    {org.verified && <VerifiedBadge small />}
                  </View>
                  <Text style={[type.caption, { color: color.textTertiary, marginTop: 2 }]}>
                    Lead organisation · {org.transparencyScore}% transparency score
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={color.textTertiary} />
              </View>
            </Card>
          </Pressable>
        )}

        <Text style={[type.h3, { color: color.textPrimary, marginTop: space.xl, marginBottom: space.md }]}>
          Needs breakdown
        </Text>
        <View style={{ gap: space.sm }}>
          {initiative.needs.map((n) => {
            const p = Math.round((n.quantityFulfilled / n.quantityRequired) * 100);
            return (
              <Card key={n.id}>
                <View style={styles.rowBetween}>
                  <Text style={[type.bodyMedium, { color: color.textPrimary }]}>{n.name}</Text>
                  <UrgencyBadge level={n.urgency} />
                </View>
                <View style={{ marginTop: space.sm }}>
                  <ProgressBar percent={p} height={6} />
                  <Text style={[type.caption, { color: color.textTertiary, marginTop: 6 }]}>
                    {n.quantityFulfilled.toLocaleString()} / {n.quantityRequired.toLocaleString()} {n.unit}
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>

        {initiative.partnersActive > 1 && (
          <Card style={{ marginTop: space.xl, backgroundColor: color.accentDim, borderColor: color.accent }}>
            <Text style={[type.micro, { color: color.accent }]}>COORDINATION</Text>
            <Text style={[type.body, { color: color.textPrimary, marginTop: space.xs }]}>
              {initiative.partnersActive} other organisations are active in this area. Combining
              efforts could reduce duplication and reach more people faster.
            </Text>
          </Card>
        )}

        <Divider />
      </ScrollView>

      <View style={styles.footer}>
        <Button label={`Donate to this initiative`} onPress={() => router.push(`/donate/${initiative.id}`)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  navRow: { paddingHorizontal: space.lg, paddingTop: space.sm },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: color.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border,
  },
  scroll: { padding: space.lg, paddingBottom: space.xxxl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: color.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border,
    backgroundColor: color.bg,
  },
});
