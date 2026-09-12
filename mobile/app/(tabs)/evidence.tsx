import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Divider, SectionHeader } from '../../components/ui';
import { color, radius, space, type } from '../../lib/theme';
import { pilotProfiles } from '../../data/pilotProfiles';

export default function EvidenceScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[type.h1, { color: color.textPrimary }]}>Evidence</Text>
          <Text style={[type.body, { color: color.textSecondary, marginTop: space.xs }]}>
            The first three profiles built from cited sources
          </Text>
        </View>

        <Card style={styles.banner}>
          <Text style={[type.micro, { color: color.accent }]}>DATA FOUNDATION · MILESTONE 1</Text>
          <Text style={[type.h2, styles.bannerTitle]}>
            Collect first. Prove second.
          </Text>
          <Text style={[type.body, { color: color.textSecondary }]}>
            Every profile below is provisional until regulator extracts and exact annual reports are reviewed.
          </Text>
        </Card>

        <SectionHeader title="Pilot profiles" />
        <View style={{ gap: space.md }}>
          {pilotProfiles.map((profile) => (
            <Card key={profile.id} style={styles.profileCard}>
              <View style={styles.topRow}>
                <View style={styles.identity}>
                  <View style={styles.logo}>
                    <Text style={styles.logoText}>{profile.name.slice(0, 1)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.h3, { color: color.textPrimary }]}>{profile.name}</Text>
                    <Text style={[type.caption, { color: color.textTertiary, marginTop: 3 }]}>
                      Charity Commission {profile.registrationNumber}
                    </Text>
                  </View>
                </View>
                <View style={styles.status}>
                  <View style={styles.statusDot} />
                  <Text style={[type.micro, { color: color.warning }]}>PROVISIONAL</Text>
                </View>
              </View>

              <Divider />
              <View style={styles.sourceSummary}>
                <Text style={[type.bodyMedium, { color: color.textPrimary }]}>
                  {profile.sources.length} cited sources
                </Text>
                <Text style={[type.caption, { color: color.accent }]}>Auditable</Text>
              </View>
              {profile.sources.map((source) => (
                <View key={`${profile.id}-${source.label}`} style={styles.sourceRow}>
                  <View style={[styles.sourceDot, { backgroundColor: source.type === 'Government / regulator' ? color.info : color.accent }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[type.caption, { color: color.textSecondary }]}>{source.label}</Text>
                    <Text style={[type.micro, { color: color.textTertiary, marginTop: 2 }]}>{source.type} · {source.observed}</Text>
                  </View>
                </View>
              ))}

              <Text style={[type.micro, styles.label]}>KNOWN SO FAR</Text>
              {profile.facts.map((fact) => (
                <Text key={fact} style={[type.caption, { color: color.textSecondary, marginTop: 4 }]}>✓ {fact}</Text>
              ))}
              <Text style={[type.micro, styles.label]}>NEXT EVIDENCE NEEDED</Text>
              {profile.gaps.map((gap) => (
                <Text key={gap} style={[type.caption, { color: color.textTertiary, marginTop: 4 }]}>· {gap}</Text>
              ))}

              {profile.identityCandidates && (
                <View style={styles.identityReview}>
                  <Text style={[type.micro, { color: color.warning }]}>MUSLIM AID IDENTITY REVIEW</Text>
                  <Text style={[type.caption, { color: color.textSecondary, marginTop: 5 }]}>
                    These records are deliberately not merged.
                  </Text>
                  {profile.identityCandidates.map((candidate) => (
                    <Text key={candidate} style={[type.caption, { color: color.textSecondary, marginTop: 5 }]}>• {candidate}</Text>
                  ))}
                </View>
              )}
            </Card>
          ))}
        </View>
        <Text style={[type.caption, styles.footerNote]}>
          Sources are captured with URL, identifier, dates, raw content and SHA-256 hash in the data foundation.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bg },
  scroll: { padding: space.lg, paddingBottom: space.xxxl },
  header: { marginBottom: space.lg },
  banner: { backgroundColor: color.accentDim, borderColor: '#15543F', marginBottom: space.xl },
  bannerTitle: { color: color.textPrimary, marginVertical: space.sm },
  profileCard: { padding: space.lg },
  topRow: { gap: space.md },
  identity: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  logo: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: color.bgElevated, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: color.accent, fontSize: 22, fontWeight: '800' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: color.warning },
  sourceSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm },
  sourceDot: { width: 8, height: 8, borderRadius: 4 },
  label: { color: color.textTertiary, marginTop: space.lg },
  identityReview: { backgroundColor: color.urgencyMediumDim, borderRadius: radius.md, padding: space.md, marginTop: space.lg },
  footerNote: { color: color.textTertiary, textAlign: 'center', marginTop: space.xl },
});
