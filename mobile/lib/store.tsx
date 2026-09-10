import React, { createContext, useContext, useState, useCallback } from 'react';
import { Donation, initiatives as seedInitiatives } from '../data/mockData';

interface GivingState {
  role: 'donor' | 'charity';
  setRole: (r: 'donor' | 'charity') => void;
  donations: Donation[];
  addDonation: (d: Omit<Donation, 'id' | 'reference'>) => Donation;
  totalDonated: number;
  fundingByInitiative: Record<string, number>;
}

const GivingContext = createContext<GivingState | null>(null);

export function GivingProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'donor' | 'charity'>('donor');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [fundingByInitiative, setFundingByInitiative] = useState<Record<string, number>>({});

  const addDonation = useCallback((d: Omit<Donation, 'id' | 'reference'>) => {
    const ref = `EC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const donation: Donation = { ...d, id: `don-${Date.now()}`, reference: ref };
    setDonations((prev) => [donation, ...prev]);
    setFundingByInitiative((prev) => ({
      ...prev,
      [d.initiativeId]: (prev[d.initiativeId] ?? 0) + d.amount,
    }));
    return donation;
  }, []);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <GivingContext.Provider
      value={{ role, setRole, donations, addDonation, totalDonated, fundingByInitiative }}
    >
      {children}
    </GivingContext.Provider>
  );
}

export function useGiving() {
  const ctx = useContext(GivingContext);
  if (!ctx) throw new Error('useGiving must be used within GivingProvider');
  return ctx;
}

export function useInitiativeFunding(initiativeId: string) {
  const { fundingByInitiative } = useGiving();
  const base = seedInitiatives.find((i) => i.id === initiativeId)?.fundingRaised ?? 0;
  return base + (fundingByInitiative[initiativeId] ?? 0);
}
