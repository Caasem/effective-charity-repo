import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { color, type, space, radius } from '../../lib/theme';
import { Card, UrgencyBadge, ProgressBar, SectionHeader, Pill, StatFigure } from '../../components/ui';
import { initiatives, networkStats, formatCurrency, fundingPercent } from '../../data/mockData';
import { useGiving } from '../../lib/store';

export default function HomeScreen() {
  const { role, setRole } = useGiving();
  const critical = initiatives.filter((i) => i.urgency === 'critical');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[type.caption, { color: color.textTertiary }]}>EFFECTIVE CHARITY</Text>
            <Text style={[type.h1, { color: color.textPrimary, marginTop: 2 }]}>
              {role === 'donor' ? 'Good morning' : 'Your network'}
            </Text>
          </View>
          <View style={styles.roleSwitch}>
            <Pressable
              onPress={() => setRole('donor')}
              style={[styles.roleBtn, role === 'donor' && styles.roleBtnActive]}
            >
              <Text style={[type.caption, { color: role === 'donor' ? color.textInverse : color.textSecondary }]}>
                Donor
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setRole('charity')}
              style={[styles.roleBtn, role === 'charity' && styles.roleBtnActive]}
            >
              <Text style={[type.caption, { color: role === 'charity' ? color.textInverse : color.textSecondary }]}>
                Charity
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Hero stat card — Revolut balance-card energy */}
        <LinearGradient
          colors={['#121A16', '#0A0B0D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={[type.caption, { color: color.textTertiary }]}>NETWORK COMMITTED — LIVE</Text>
          <StatFigure value={formatCurrency(networkStats.totalCommitted)} label="across the network right now" huge />
          <View style={styles.heroRow}>
            <HeroMini value={String(networkStats.activeInitiatives)} label="initiatives" />
            <HeroMini value={String(networkStats.organisations)} label="organisations" />
            <HeroMini value={String(networkStats.openNeeds)} label="open needs" />
          </View>
        </LinearGradient>

        {/* Critical needs — urgency is the product */}
        <SectionHeader
          title="Critical right now"
          action="See all"
          onAction={() => router.push('/(tabs)/initiatives')}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={critical}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ gap: space.md, paddingRight: space.lg }}
          renderItem={({ item }) => (
            <Card
              style={styles.criticalCard}
              onPress={() => router.push(`/initiative/${item.id}`)}
            >
              <View style={styles.rowBetween}>
                <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                <UrgencyBadge level={item.urgency} />
              </View>
              <Text style={[type.h3, { color: color.textPrimary, marginTop: space.md }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[type.caption, { color: color.textTertiary, marginTop: 2 }]}>
                {item.location}, {item.country}
              </Text>
              <View style={{ marginTop: space.md }}>
                <ProgressBar percent={fundingPercent(item)} color={color.urgencyCritical} />
                <View style={[styles.rowBetween, { marginTop: space.sm }]}>
                  <Text style={[type.bodyMedium, { color: color.textPrimary }]}>
                    {formatCurrency(item.fundingRaised)}
                  </Text>
                  <Text style={[type.caption, { color: color.textTertiary }]}>
                    of {formatCurrency(item.fundingGoal)}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        />

        {/* Quick giving types — Revolut-style pills */}
        <SectionHeader title="Give now" />
        <View style={styles.pillRow}>
          {['Sadaqah', 'Zakat', 'Waqf', 'Recurring'].map((t) => (
            <Pill key={t} label={t} onPress={() => router.push('/(tabs)/initiatives')} />
          ))}
        </View>

        {/* Coordination teaser — the differentiator */}
        <Card style={{ marginTop: space.xl }}>
          <Text style={[type.micro, { color: color.accent }]}>COORDINATION</Text>
          <Text style={[type.h3, { color: color.textPrimary, marginTop: space.sm }]}>
            3 organisations are active in Darfur right now
          </Text>
          <Text style={[type.body, { color: color.textSecondary, marginTop: space.xs }]}>
            Food distribution, logistics and medical response could be combined into one
            coordinated response instead of three separate ones.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroMini({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[type.statLg, { color: color.textPrimary, fontSize: 22 }]}>{value}</Text>
      <Text style={[type.micro, { color: color.textTertiary, marginTop: 2 }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  scroll: { padding: space.lg, paddingBottom: space.xxxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space.lg,
  },
  roleSwitch: {
    flexDirection: 'row',
    backgroundColor: color.bgCard,
    borderRadius: radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: color.border,
  },
  roleBtn: { paddingHorizontal: space.md, paddingVertical: 6, borderRadius: radius.pill },
  roleBtnActive: { backgroundColor: color.accent },
  heroCard: {
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    marginBottom: space.xl,
  },
  heroRow: {
    flexDirection: 'row',
    marginTop: space.xl,
    paddingTop: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border,
  },
  criticalCard: { width: 240 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.xl },
});
