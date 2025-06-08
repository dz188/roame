// types/types.ts

export type OfferAmount = {
  amount: number;
};

export type Offer = {
  spend: number;
  amount: OfferAmount[];
  days: number;
  credits: any[]; 
  details?: string;
  expiration?: string;
};

export type Card = {
  cardId: string;
  name: string;
  issuer: string;
  network: string;
  currency: string;
  isBusiness: boolean;
  annualFee: number;
  isAnnualFeeWaived: boolean;
  universalCashbackPercent: number;
  url: string;
  imageUrl: string;
  credits: any[]; 
  offers: Offer[];
  historicalOffers: Offer[];
  discontinued: boolean;
  appliedDate?: string; 

  // These two are optional because your raw data doesn't have them:
  multipliers?: Record<string, number>;  // e.g. {"dining": 3, "travel": 2}
  bonus_value?: number;                   // total bonus value (optional)
};

export type Recommendation = {
  card: Card;
  applyAfterMonths: number;
  expectedValue: number;
   reason?: string;
};

export interface CardWithAppliedDate extends Card {
  appliedDate?: string;
}

// types.ts

export interface ApplicationHistory {
  cardId: string;
  appliedAt: string; // ISO date string
}

export interface Constraints {
  maxAppsPerIssuerInMonths?: Record<string, { maxApps: number; months: number }>;
  enforceLifetimeBonus?: boolean;
  issuerCardLimits?: Record<string, { maxOpenCards: number; months: number }>;
  enforceIssuerRules?: boolean; 
}
