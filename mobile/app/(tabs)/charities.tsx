import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { color, type, space, radius } from '../../lib/theme';
import { Card, VerifiedBadge } from '../../components/ui';
import { organisations, formatCurrency } from '../../data/mockData';

export default function CharitiesScreen() {
  const charities = organisations.filter((o) => o.type !== 'business');
  const businesses = organisations.filter((o) => o.type === 'business');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={[type.h1, { color: color.textPrimary }]}>Organisations</Text>
        <Text style={[type.body, { color: color.textSecondary, marginTop: 2 }]}>
          Verified charities and business partners
        </Text>
      </View>

      <FlatList
        data={[...charities, { id: '__divider__' } as any, ...businesses]}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.id === '__divider__') {
            return <Text style={[type.micro, { color: color.textTertiary, marginVertical: space.sm }]}>BUSINESS PARTNERS</Text>;
          }
          const org = item as (typeof organisations)[number];
          return (
            <Card onPress={() => router.push(`/charity/${org.id}`)}>
              <View style={styles.row}>
                <View style={styles.logoCircle}>
                  <Text style={{ fontSize: 26 }}>{org.logo}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowBetween}>
                    <Text style={[type.h3, { color: color.textPrimary }]} numberOfLines={1}>
                      {org.name}
                    </Text>
                    {org.verified && <VerifiedBadge small />}
                  </View>
                  <Text style={[type.caption, { color: color.textTertiary, marginTop: 2 }]} numberOfLines={1}>
                    {org.areasOfFocus.join(' · ')}
                  </Text>
                  <View style={[styles.rowBetween, { marginTop: space.sm }]}>
                    <Text style={[type.caption, { color: color.textSecondary }]}>
                      ⭐ {org.rating} · {org.activeInitiatives} active
                    </Text>
                    {org.type !== 'business' && (
                      <Text style={[type.caption, { color: color.accent }]}>
                        {formatCurrency(org.totalRaised)} raised
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  header: { paddingHorizontal: space.lg, paddingTop: space.md, marginBottom: space.lg },
  list: { paddingHorizontal: space.lg, paddingBottom: space.xxxl, gap: space.md },
  row: { flexDirection: 'row', gap: space.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: color.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
