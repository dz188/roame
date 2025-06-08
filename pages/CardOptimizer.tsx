import React, { useState } from 'react';

type Card = {
  cardId: string;
  name: string;
  issuer: string;
  network: string;
  currency: string;
  isBusiness: boolean;
  annualFee: number | null;
  isAnnualFeeWaived: boolean;
  universalCashbackPercent: number;
  multipliers: Record<string, number>;
  url: string;
  imageUrl: string;
  credits: any[];
  offers: {
    spend: number;
    amount: { amount: number; type: string }[];
  }[];
  historicalOffers: any[];
  discontinued: boolean;
  lifetimeBonus?: boolean;
};

type Recommendation = {
  card: Card;
  applyAfterMonths: number;
  expectedValue: number;
};

type ApplicationHistoryEntry = {
  cardId: string;
  appliedAt: string; // ISO date string
};

export default function CardOptimizer() {
  const [currentCards, setCurrentCards] = useState<Card[]>([]);
  const [newCardName, setNewCardName] = useState('');
  const [upcomingSpend, setUpcomingSpend] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  // Dummy function to add a card - here you may want to fetch real card info by name later
  function addCard() {
    if (newCardName.trim() === '') return;
    const newCard: Card = {
      cardId: String(Date.now()),
      name: newCardName,
      issuer: 'Bank A',
      network: 'Visa',
      currency: 'USD',
      isBusiness: false,
      annualFee: 0,
      isAnnualFeeWaived: true,
      universalCashbackPercent: 0,
      multipliers: {},
      url: '',
      imageUrl: '',
      credits: [],
      offers: [],
      historicalOffers: [],
      discontinued: false,
      lifetimeBonus: false,
    };
    setCurrentCards([...currentCards, newCard]);
    setNewCardName('');
  }

  function removeCard(cardId: string) {
    setCurrentCards(currentCards.filter(card => card.cardId !== cardId));
  }

  async function handleOptimize() {
    setLoading(true);

    // Example application history: cardId + appliedAt date string
    const applicationHistory: ApplicationHistoryEntry[] = [
      { cardId: 'chase123', appliedAt: new Date(Date.now() - 6 * 30 * 24 * 3600 * 1000).toISOString() },
      { cardId: 'amex456', appliedAt: new Date(Date.now() - 14 * 30 * 24 * 3600 * 1000).toISOString() },
      { cardId: 'bankA789', appliedAt: new Date(Date.now() - 22 * 30 * 24 * 3600 * 1000).toISOString() },
    ];

    // Constraints example for applying realistic rules
    const constraints = {
      maxAppsPerIssuerInMonths: {
        chase: { maxApps: 5, months: 24 },
        amex: { maxApps: 3, months: 12 },
      },
      minMonthsBetweenApplications: 3, // minimum months gap between applications overall
      enforceLifetimeBonus: true,
    };

    const res = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCards,
        upcomingSpend,
        applicationHistory,
        constraints,
        spendingCategory: 'travel', // example category, can be dynamic input
      }),
    });

    const data = await res.json();
    setRecommendations(data);
    setLoading(false);
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Credit Card Optimizer</h2>

      <div className="mb-4">
        <label className="block mb-1">Upcoming Spend:</label>
        <input
          type="number"
          value={upcomingSpend}
          onChange={e => setUpcomingSpend(Number(e.target.value))}
          className="border px-2 py-1 w-40"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Add Current Card:</label>
        <input
          type="text"
          value={newCardName}
          onChange={e => setNewCardName(e.target.value)}
          className="border px-2 py-1 mr-2"
          placeholder="Card name"
        />
        <button onClick={addCard} className="bg-blue-500 text-white px-3 py-1">
          Add
        </button>
      </div>

      <h3 className="font-semibold mb-1">Current Cards</h3>
      <ul className="mb-4">
        {currentCards.map(card => (
          <li key={card.cardId}>
            {card.name} ({card.issuer}){' '}
            <button onClick={() => removeCard(card.cardId)} className="text-red-500 ml-2">
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button onClick={handleOptimize} disabled={loading} className="bg-green-600 text-white px-4 py-2">
        {loading ? 'Optimizing...' : 'Get Recommendations'}
      </button>

      <h3 className="font-semibold mt-6 mb-1">Recommended Cards</h3>
      <ul>
        {recommendations.map(r => (
          <li key={r.card.cardId}>
            {r.card.name} ({r.card.issuer}) — Expected Value: ${r.expectedValue.toFixed(2)} (Apply After {r.applyAfterMonths} months)
          </li>
        ))}
      </ul>
    </div>
  );
}
