import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { color, type, space, radius } from '../../lib/theme';
import { Button, Card, Divider } from '../../components/ui';
import { initiatives, formatCurrency, Donation } from '../../data/mockData';
import { useGiving } from '../../lib/store';

type GivingType = 'sadaqah' | 'zakat' | 'waqf' | 'recurring';
const QUICK_AMOUNTS = [10, 25, 50, 100, 250];
const GIVING_TYPES: { key: GivingType; label: string; desc: string }[] = [
  { key: 'sadaqah', label: 'Sadaqah', desc: 'Voluntary charity, any time' },
  { key: 'zakat', label: 'Zakat', desc: 'Obligatory almsgiving' },
  { key: 'waqf', label: 'Waqf', desc: 'Endowment for lasting impact' },
  { key: 'recurring', label: 'Recurring', desc: 'Monthly automatic giving' },
];

export default function DonateFlow() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const initiative = initiatives.find((i) => i.id === id);
  const { addDonation } = useGiving();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [givingType, setGivingType] = useState<GivingType>('sadaqah');
  const [amount, setAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [card, setCard] = useState('');
  const [donation, setDonation] = useState<Donation | null>(null);

  if (!initiative) return null;

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : amount ?? 0;

  function handlePay() {
    const d = addDonation({
      initiativeId: initiative!.id,
      amount: finalAmount,
      givingType,
      date: new Date().toISOString(),
    });
    setDonation(d);
    setStep(3);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.navRow}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={color.textPrimary} />
        </Pressable>
        <View style={styles.stepDots}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[styles.dot, { backgroundColor: s <= step ? color.accent : color.border }]}
            />
          ))}
        </View>
        <View style={{ width: 36 }} />
      </View>

      {step === 1 && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[type.h2, { color: color.textPrimary }]}>
            {initiative.emoji} {initiative.title}
          </Text>
          <Text style={[type.caption, { color: color.textTertiary, marginTop: 4 }]}>
            {initiative.location}, {initiative.country}
          </Text>

          <Text style={[type.h3, { color: color.textPrimary, marginTop: space.xl, marginBottom: space.md }]}>
            Giving type
          </Text>
          <View style={{ gap: space.sm }}>
            {GIVING_TYPES.map((g) => (
              <Pressable key={g.key} onPress={() => setGivingType(g.key)}>
                <Card
                  style={{
                    borderColor: givingType === g.key ? color.accent : color.borderSubtle,
                    backgroundColor: givingType === g.key ? color.accentDim : color.bgCard,
                  }}
                >
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={[type.bodyMedium, { color: color.textPrimary }]}>{g.label}</Text>
                      <Text style={[type.caption, { color: color.textTertiary, marginTop: 2 }]}>{g.desc}</Text>
                    </View>
                    {givingType === g.key && <Ionicons name="checkmark-circle" size={22} color={color.accent} />}
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>

          <Text style={[type.h3, { color: color.textPrimary, marginTop: space.xl, marginBottom: space.md }]}>
            Amount
          </Text>
          <View style={styles.amountGrid}>
            {QUICK_AMOUNTS.map((a) => (
              <Pressable
                key={a}
                onPress={() => {
                  setAmount(a);
                  setCustomAmount('');
                }}
                style={[
                  styles.amountChip,
                  amount === a && !customAmount && { backgroundColor: color.accent, borderColor: color.accent },
                ]}
              >
                <Text
                  style={[
                    type.bodyMedium,
                    { color: amount === a && !customAmount ? color.textInverse : color.textPrimary },
                  ]}
                >
                  £{a}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={customAmount}
            onChangeText={setCustomAmount}
            placeholder="Or enter a custom amount"
            placeholderTextColor={color.textTertiary}
            keyboardType="decimal-pad"
            style={styles.customInput}
          />

          <View style={{ marginTop: space.xxl }}>
            <Button
              label={`Continue with £${finalAmount || 0}`}
              onPress={() => setStep(2)}
              disabled={finalAmount <= 0}
            />
          </View>
        </ScrollView>
      )}

      {step === 2 && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[type.h2, { color: color.textPrimary }]}>Payment details</Text>
          <Text style={[type.caption, { color: color.textTertiary, marginTop: 4 }]}>
            This is a demo — no real payment is processed
          </Text>

          <Card style={{ marginTop: space.xl }}>
            <Text style={[type.caption, { color: color.textTertiary }]}>YOU'RE GIVING</Text>
            <Text style={[type.statLg, { color: color.textPrimary, marginTop: 4 }]}>£{finalAmount}</Text>
            <Text style={[type.caption, { color: color.textSecondary, marginTop: 4 }]}>
              {GIVING_TYPES.find((g) => g.key === givingType)?.label} to {initiative.title}
            </Text>
          </Card>

          <Text style={[type.caption, { color: color.textTertiary, marginTop: space.xl, marginBottom: space.sm }]}>
            CARD NUMBER
          </Text>
          <TextInput
            value={card}
            onChangeText={setCard}
            placeholder="4242 4242 4242 4242"
            placeholderTextColor={color.textTertiary}
            keyboardType="number-pad"
            style={styles.customInput}
          />
          <View style={styles.row2col}>
            <TextInput placeholder="MM/YY" placeholderTextColor={color.textTertiary} style={[styles.customInput, { flex: 1 }]} />
            <TextInput placeholder="CVC" placeholderTextColor={color.textTertiary} style={[styles.customInput, { flex: 1 }]} />
          </View>

          <View style={{ marginTop: space.xxl }}>
            <Button label={`Confirm £${finalAmount} donation`} onPress={handlePay} />
          </View>
        </ScrollView>
      )}

      {step === 3 && donation && (
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color={color.textInverse} />
          </View>
          <Text style={[type.h1, { color: color.textPrimary, marginTop: space.xl, textAlign: 'center' }]}>
            Jazakum Allahu Khayran
          </Text>
          <Text style={[type.body, { color: color.textSecondary, marginTop: space.sm, textAlign: 'center' }]}>
            Your {formatCurrency(donation.amount)} {donation.givingType} donation to {initiative.title} is confirmed.
          </Text>

          <Card style={{ marginTop: space.xxl, width: '100%' }}>
            <View style={styles.rowBetween}>
              <Text style={[type.caption, { color: color.textTertiary }]}>Reference</Text>
              <Text style={[type.bodyMedium, { color: color.textPrimary }]}>{donation.reference}</Text>
            </View>
            <Divider />
            <View style={styles.rowBetween}>
              <Text style={[type.caption, { color: color.textTertiary }]}>Amount</Text>
              <Text style={[type.bodyMedium, { color: color.textPrimary }]}>{formatCurrency(donation.amount)}</Text>
            </View>
          </Card>

          <View style={{ marginTop: space.xxl, width: '100%' }}>
            <Button label="Done" onPress={() => router.replace('/(tabs)')} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: color.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 22, height: 4, borderRadius: 2 },
  scroll: { padding: space.lg, paddingBottom: space.xxxl },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  amountChip: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.bgCard,
  },
  customInput: {
    marginTop: space.md,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.bgCard,
    paddingHorizontal: space.lg,
    color: color.textPrimary,
    fontSize: 16,
  },
  row2col: { flexDirection: 'row', gap: space.md },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
