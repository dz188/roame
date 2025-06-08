import { normalizeCardData } from '../lib/normalize';
import { Card } from '../types/types';

describe('normalizeCardData', () => {
  it('should normalize card data with travel and dining multipliers', () => {
    const rawData = [
      {
        cardId: 'travel1',
        name: 'Travel Card',
        issuer: 'Travel Bank',
        annualFee: 95,
        universalCashbackPercent: 1,
        multipliers: [
          { category: 'travel', multiplier: 3 },
          { category: 'dining', multiplier: 2 },
        ],
        network: 'Visa',
        currency: 'USD',
        isBusiness: false,
        isAnnualFeeWaived: false,
        url: 'https://travelcard.example.com',
        imageUrl: '/images/travel-card.webp',
        credits: [],
        offers: [],
        historicalOffers: [],
        discontinued: false,
      },
    ];

    const expected: Card[] = [
      {
        cardId: 'travel1',
        name: 'Travel Card',
        issuer: 'Travel Bank',
        annualFee: 95,
        universalCashbackPercent: 1,
        multipliers: { travel: 3, dining: 2 },
        network: 'Visa',
        currency: 'USD',
        isBusiness: false,
        isAnnualFeeWaived: false,
        url: 'https://travelcard.example.com',
        imageUrl: '/images/travel-card.webp',
        credits: [],
        offers: [],
        historicalOffers: [],
        discontinued: false,
      },
    ];

    expect(normalizeCardData(rawData)).toEqual(expected);
  });

  it('should normalize card data with no multipliers defined', () => {
    const rawData = [
      {
        cardId: 'noMulti1',
        name: 'No Multiplier Card',
        issuer: 'Basic Bank',
        annualFee: 0,
        universalCashbackPercent: 1.5,
        // ❌ no multipliers
        network: 'Mastercard',
        currency: 'USD',
        isBusiness: false,
        isAnnualFeeWaived: true,
        url: 'https://nomultiplier.example.com',
        imageUrl: '/images/no-multi-card.webp',
        credits: [],
        offers: [],
        historicalOffers: [],
        discontinued: false,
      },
    ];

    const expected: Card[] = [
      {
        cardId: 'noMulti1',
        name: 'No Multiplier Card',
        issuer: 'Basic Bank',
        annualFee: 0,
        universalCashbackPercent: 1.5,
        multipliers: {}, // ✅ fallback
        network: 'Mastercard',
        currency: 'USD',
        isBusiness: false,
        isAnnualFeeWaived: true,
        url: 'https://nomultiplier.example.com',
        imageUrl: '/images/no-multi-card.webp',
        credits: [],
        offers: [],
        historicalOffers: [],
        discontinued: false,
      },
    ];

    expect(normalizeCardData(rawData)).toEqual(expected);
  });
});
