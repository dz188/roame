// lib/normalize.ts
import { Card } from '../types/types';
export function normalizeCardData(rawData: any[]): Card[] {
  return rawData.map(item => {
    
    return {
      cardId: item.cardId || item.id || '',
      name: item.name || '',
      issuer: item.issuer || '',
      network: item.network || 'unknown',
      currency: item.currency || 'USD',
      isBusiness: item.isBusiness ?? false,
      annualFee: typeof item.annualFee === 'number' ? item.annualFee : null,
      isAnnualFeeWaived: item.isAnnualFeeWaived ?? false,
      universalCashbackPercent: item.universalCashbackPercent ?? 0,
      multipliers: Array.isArray(item.multipliers)
        ? Object.fromEntries(
            item.multipliers.map((m: { category: string; multiplier: number }) => [m.category, m.multiplier])
          )
        : item.multipliers || {},
      url: item.url || '',
      imageUrl: item.imageUrl || '',
      credits: item.credits || [],
      offers: item.offers || [],
      historicalOffers: item.historicalOffers || [],
      discontinued: item.discontinued ?? false,
    };
  });
}
