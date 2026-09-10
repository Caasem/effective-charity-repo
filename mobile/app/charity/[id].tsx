import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { color, type, space, radius } from '../../lib/theme';
import { Card, VerifiedBadge, Divider, StatFigure, Button } from '../../components/ui';
import { organisations, initiatives, formatCurrency } from '../../data/mockData';

export default function CharityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const org = organisations.find((o) => o.id === id);
  if (!org) return null;

  const orgInitiatives = initiatives.filter((i) => i.organisationId === org.id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.navRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={color.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.logoCircle}>
            <Text style={{ fontSize: 36 }}>{org.logo}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.rowBetween}>
              <Text style={[type.h2, { color: color.textPrimary, flex: 1 }]}>{org.name}</Text>
            </View>
            {org.verified && <VerifiedBadge />}
          </View>
        </View>

        <Text style={[type.body, { color: color.textSecondary, marginTop: space.lg }]}>
          {org.description}
        </Text>

        <Card style={{ marginTop: space.xl }}>
          <View style={styles.statGrid}>
            <StatFigure value={`${org.rating}★`} label="RATING" />
            <StatFigure value={`${org.transparencyScore}%`} label="TRANSPARENCY" />
            <StatFigure value={formatCurrency(org.totalRaised)} label="RAISED" />
          </View>
          <Divider />
          <View style={styles.rowBetween}>
            <Text style={[type.caption, { color: color.textTertiary }]}>Founded</Text>
            <Text style={[type.bodyMedium, { color: color.textPrimary }]}>{org.foundedYear}</Text>
          </View>
          <View style={[styles.rowBetween, { marginTop: space.sm }]}>
            <Text style={[type.caption, { color: color.textTertiary }]}>Active initiatives</Text>
            <Text style={[type.bodyMedium, { color: color.textPrimary }]}>{org.activeInitiatives}</Text>
          </View>
        </Card>

        <Text style={[type.h3, { color: color.textPrimary, marginTop: space.xl, marginBottom: space.md }]}>
          Areas of focus
        </Text>
        <View style={styles.tagRow}>
          {org.areasOfFocus.map((a) => (
            <View key={a} style={styles.tag}>
              <Text style={[type.caption, { color: color.textSecondary }]}>{a}</Text>
            </View>
          ))}
        </View>

        <Text style={[type.h3, { color: color.textPrimary, marginTop: space.xl, marginBottom: space.md }]}>
          Operating in
        </Text>
        <View style={styles.tagRow}>
          {org.operatingCountries.map((c) => (
            <View key={c} style={styles.tag}>
              <Text style={[type.caption, { color: color.textSecondary }]}>{c}</Text>
            </View>
          ))}
        </View>

        {orgInitiatives.length > 0 && (
          <>
            <Text style={[type.h3, { color: color.textPrimary, marginTop: space.xl, marginBottom: space.md }]}>
              Active initiatives
            </Text>
            <View style={{ gap: space.sm }}>
              {orgInitiatives.map((i) => (
                <Card key={i.id} onPress={() => router.push(`/initiative/${i.id}`)}>
                  <View style={styles.rowBetween}>
                    <Text style={[type.bodyMedium, { color: color.textPrimary }]}>
                      {i.emoji} {i.title}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={color.textTertiary} />
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {org.type !== 'business' && orgInitiatives[0] && (
        <View style={styles.footer}>
          <Button label="Donate to this organisation" onPress={() => router.push(`/donate/${orgInitiatives[0].id}`)} />
        </View>
      )}
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
  headerRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: color.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border,
  },
  statGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tag: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: color.bgCard,
    borderWidth: 1,
    borderColor: color.border,
  },
  footer: {
    padding: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border,
    backgroundColor: color.bg,
  },
});
