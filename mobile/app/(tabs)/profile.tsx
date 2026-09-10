import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color, type, space, radius } from '../../lib/theme';
import { Card, Divider, StatFigure } from '../../components/ui';
import { useGiving } from '../../lib/store';
import { initiatives, formatCurrency } from '../../data/mockData';

export default function ProfileScreen() {
  const { donations, totalDonated, role } = useGiving();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 28 }}>👤</Text>
          </View>
          <View>
            <Text style={[type.h2, { color: color.textPrimary }]}>Your Giving</Text>
            <Text style={[type.caption, { color: color.textTertiary }]}>
              {role === 'donor' ? 'Donor account' : 'Charity account'}
            </Text>
          </View>
        </View>

        <Card style={{ marginTop: space.xl }}>
          <StatFigure value={formatCurrency(totalDonated)} label="TOTAL GIVEN THIS SESSION" huge />
          <Divider />
          <View style={styles.statRow}>
            <StatFigure value={String(donations.length)} label="DONATIONS" />
            <StatFigure value={String(new Set(donations.map((d) => d.initiativeId)).size)} label="CAUSES" />
          </View>
        </Card>

        <Text style={[type.h3, { color: color.textPrimary, marginTop: space.xl, marginBottom: space.md }]}>
          Donation history
        </Text>

        {donations.length === 0 ? (
          <Card>
            <Text style={[type.body, { color: color.textSecondary }]}>
              No donations yet. Find an initiative and give — it takes under a minute.
            </Text>
          </Card>
        ) : (
          <View style={{ gap: space.sm }}>
            {donations.map((d) => {
              const initiative = initiatives.find((i) => i.id === d.initiativeId);
              return (
                <Card key={d.id}>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={[type.bodyMedium, { color: color.textPrimary }]}>
                        {initiative?.title ?? 'Initiative'}
                      </Text>
                      <Text style={[type.caption, { color: color.textTertiary, marginTop: 2 }]}>
                        {d.givingType.toUpperCase()} · {d.reference}
                      </Text>
                    </View>
                    <Text style={[type.bodyMedium, { color: color.accent }]}>
                      {formatCurrency(d.amount)}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  scroll: { padding: space.lg, paddingBottom: space.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: color.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border,
  },
  statRow: { flexDirection: 'row', gap: space.xxl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
