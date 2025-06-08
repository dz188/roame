import { optimizeCards } from '../lib/optimizer';
import { Card, Constraints } from '../types/types';

describe('optimizeCards', () => {
  const USD_TO_POINTS = 100;

  const testCards: Card[] = [
    {
      cardId: 'chase-sapphire-preferred',
      name: 'Chase Sapphire Preferred',
      issuer: 'CHASE',
      network: 'VISA',
      currency: 'CHASE',
      isBusiness: false,
      annualFee: 95,
      isAnnualFeeWaived: false,
      universalCashbackPercent: 1,
      multipliers: { travel: 2 },
      url: 'https://example.com/sapphire-preferred',
      imageUrl: '/images/chase/sapphire-preferred.png',
      credits: [
        {
          description: 'Hotel Credit',
          value: 50,
          weight: 0.9,
        },
      ],
      offers: [
        {
          spend: 4000,
          amount: [{ amount: 60000 }],
          days: 90,
          credits: [],
        },
      ],
      historicalOffers: [],
      discontinued: false,
    },
    {
      cardId: 'chase-sapphire-reserve',
      name: 'Chase Sapphire Reserve',
      issuer: 'CHASE',
      network: 'VISA',
      currency: 'CHASE',
      isBusiness: false,
      annualFee: 550,
      isAnnualFeeWaived: false,
      universalCashbackPercent: 1,
      multipliers: { travel: 3 },
      url: 'https://example.com/sapphire-reserve',
      imageUrl: '/images/chase/sapphire-reserve.png',
      credits: [
        {
          description: 'Double-Dippable $300 Travel Credit',
          value: 600,
          weight: 0.95,
        },
      ],
      offers: [
        {
          spend: 5000,
          amount: [{ amount: 60000 }],
          days: 90,
          credits: [],
        },
      ],
      historicalOffers: [],
      discontinued: false,
    },
  ];

  const constraints: Constraints = {
    enforceIssuerRules: true,
    enforceLifetimeBonus: false,
    maxAppsPerIssuerInMonths: {},
  };

  it('recommends best cards based on expected value with travel category', () => {
  const recommendations = optimizeCards(
    [],
    5000,
    testCards,
    'travel',
    [],
    constraints
  );

  expect(recommendations.length).toBeGreaterThan(0);
  const preferred = recommendations.find(r => r.card.cardId === 'chase-sapphire-preferred');
  const reserve = recommendations.find(r => r.card.cardId === 'chase-sapphire-reserve');

  const USD_TO_POINTS = 100;

  const preferredPoints = 60000 + 5000 * 2  - 95 * USD_TO_POINTS; // = 70000 - 9500 = 60500
  const reservePoints = 60000 + 5000 * 3  - 550 * USD_TO_POINTS; // = 75000 - 55000 = 20000

  expect(preferred?.expectedValue).toBeCloseTo(preferredPoints / USD_TO_POINTS, 1); // 605
  expect(reserve?.expectedValue).toBeCloseTo(reservePoints / USD_TO_POINTS, 1);     // 200
});
});
