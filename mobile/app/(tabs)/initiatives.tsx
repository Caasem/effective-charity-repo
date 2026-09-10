import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { color, type, space, radius } from '../../lib/theme';
import { Card, UrgencyBadge, ProgressBar, Pill } from '../../components/ui';
import { initiatives, formatCurrency, fundingPercent } from '../../data/mockData';

const categories = ['All', 'Food', 'Healthcare', 'Shelter', 'Water', 'Education'];

export default function InitiativesScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    return initiatives.filter((i) => {
      const matchesCategory = category === 'All' || i.category === category;
      const matchesQuery =
        query.trim() === '' ||
        i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.location.toLowerCase().includes(query.toLowerCase()) ||
        i.country.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={[type.h1, { color: color.textPrimary }]}>Initiatives</Text>
        <Text style={[type.body, { color: color.textSecondary, marginTop: 2 }]}>
          {filtered.length} active right now
        </Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={color.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by location or cause"
          placeholderTextColor={color.textTertiary}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(c) => c}
        contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.lg }}
        renderItem={({ item }) => (
          <Pill label={item} active={item === category} onPress={() => setCategory(item)} />
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => router.push(`/initiative/${item.id}`)}>
            <View style={styles.row}>
              <View style={styles.emojiCircle}>
                <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowBetween}>
                  <Text style={[type.h3, { color: color.textPrimary, flex: 1 }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <UrgencyBadge level={item.urgency} />
                </View>
                <Text style={[type.caption, { color: color.textTertiary, marginTop: 2 }]}>
                  {item.location}, {item.country}
                </Text>
              </View>
            </View>
            <View style={{ marginTop: space.md }}>
              <ProgressBar percent={fundingPercent(item)} />
              <View style={[styles.rowBetween, { marginTop: space.sm }]}>
                <Text style={[type.bodyMedium, { color: color.textPrimary }]}>
                  {formatCurrency(item.fundingRaised)} raised
                </Text>
                <Text style={[type.caption, { color: color.textTertiary }]}>
                  {fundingPercent(item)}% of {formatCurrency(item.fundingGoal)}
                </Text>
              </View>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  header: { paddingHorizontal: space.lg, paddingTop: space.md, marginBottom: space.lg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.lg,
    marginBottom: space.lg,
    backgroundColor: color.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    paddingHorizontal: space.md,
    height: 46,
  },
  searchInput: { flex: 1, color: color.textPrimary, fontSize: 15 },
  list: { paddingHorizontal: space.lg, paddingBottom: space.xxxl, gap: space.md },
  card: { marginBottom: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: color.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
