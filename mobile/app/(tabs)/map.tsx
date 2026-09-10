import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Circle, Line } from 'react-native-svg';
import { router } from 'expo-router';
import { color, type, space, radius, urgencyColor } from '../../lib/theme';
import { Card, UrgencyBadge, Button } from '../../components/ui';
import { initiatives, formatCurrency } from '../../data/mockData';

const { width } = Dimensions.get('window');
const MAP_H = 320;
const MAP_W = width - space.lg * 2;

export default function MapScreen() {
  const [selected, setSelected] = useState(initiatives[0]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={[type.h1, { color: color.textPrimary }]}>Needs Map</Text>
        <Text style={[type.body, { color: color.textSecondary, marginTop: 2 }]}>
          Live view of where help is needed
        </Text>
      </View>

      <View style={styles.mapWrap}>
        <Svg width={MAP_W} height={MAP_H}>
          {/* simple lat/long style grid to suggest a world map without external assets */}
          {Array.from({ length: 9 }).map((_, i) => (
            <Line
              key={`v${i}`}
              x1={(MAP_W / 8) * i}
              y1={0}
              x2={(MAP_W / 8) * i}
              y2={MAP_H}
              stroke={color.borderSubtle}
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <Line
              key={`h${i}`}
              x1={0}
              y1={(MAP_H / 5) * i}
              x2={MAP_W}
              y2={(MAP_H / 5) * i}
              stroke={color.borderSubtle}
              strokeWidth={1}
            />
          ))}
          <Rect x={0} y={0} width={MAP_W} height={MAP_H} rx={radius.lg} fill="transparent" />
          {initiatives.map((i) => {
            const c = urgencyColor(i.urgency);
            const cx = (i.coordinates.x / 100) * MAP_W;
            const cy = (i.coordinates.y / 100) * MAP_H;
            const isSelected = selected.id === i.id;
            return (
              <React.Fragment key={i.id}>
                {isSelected && <Circle cx={cx} cy={cy} r={18} fill={c.fg} opacity={0.15} />}
                <Circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 9 : 7}
                  fill={c.fg}
                  stroke={color.bg}
                  strokeWidth={2}
                />
              </React.Fragment>
            );
          })}
        </Svg>
        {/* Transparent pressable overlay per marker for touch targets */}
        {initiatives.map((i) => (
          <Pressable
            key={i.id}
            onPress={() => setSelected(i)}
            style={{
              position: 'absolute',
              left: (i.coordinates.x / 100) * MAP_W - 18,
              top: (i.coordinates.y / 100) * MAP_H - 18,
              width: 36,
              height: 36,
            }}
          />
        ))}
      </View>

      <Card style={styles.detailCard} onPress={() => router.push(`/initiative/${selected.id}`)}>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Text style={{ fontSize: 22 }}>{selected.emoji}</Text>
            <View>
              <Text style={[type.h3, { color: color.textPrimary }]}>{selected.title}</Text>
              <Text style={[type.caption, { color: color.textTertiary }]}>
                {selected.location}, {selected.country}
              </Text>
            </View>
          </View>
          <UrgencyBadge level={selected.urgency} />
        </View>
        <View style={[styles.rowBetween, { marginTop: space.lg }]}>
          <Text style={[type.body, { color: color.textSecondary }]}>
            {formatCurrency(selected.fundingRaised)} raised of {formatCurrency(selected.fundingGoal)}
          </Text>
          <Text style={[type.caption, { color: color.accent }]}>
            {selected.partnersActive} orgs active nearby
          </Text>
        </View>
        <View style={{ marginTop: space.lg }}>
          <Button label="View initiative" onPress={() => router.push(`/initiative/${selected.id}`)} />
        </View>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  header: { paddingHorizontal: space.lg, paddingTop: space.md, marginBottom: space.lg },
  mapWrap: {
    marginHorizontal: space.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: color.bgCard,
    borderWidth: 1,
    borderColor: color.border,
  },
  detailCard: { margin: space.lg, marginTop: space.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
});
