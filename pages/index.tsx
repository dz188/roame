import { useState } from 'react';
import cards from '../data/cards.json';
import { Card, Recommendation } from '../types/types';

export default function Home() {
  const [upcomingSpend, setUpcomingSpend] = useState<number>(1000);
  const [spendingCategory, setSpendingCategory] = useState<string>('groceries');
  const [currentCards, setCurrentCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [appliedDate, setAppliedDate] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCards: Card[] = cards;

  const addCard = () => {
    if (!selectedCardId) return;

    // avoid taking the same card
    if (currentCards.some(c => c.cardId === selectedCardId)) {
      alert('This card is already added.');
      return;
    }

    const card = availableCards.find(c => c.cardId === selectedCardId);
    if (card) {
      setCurrentCards(prev => [
        ...prev,
        {
          cardId: card.cardId,
          name: card.name,
          issuer: card.issuer,
          appliedDate,
        },
      ]);
      setSelectedCardId('');
      setAppliedDate('');
    }
  };

  // remove card function
  const removeCard = (cardId: string) => {
    setCurrentCards(prev => prev.filter(c => c.cardId !== cardId));
  };

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);

    try {
      const applicationHistory = currentCards.map(card => {
        let appliedAt = card.appliedDate;
        if (!appliedAt) {
          const today = new Date();
          let pastDate = new Date(today);
          if (card.issuer.toLowerCase() === 'chase') {
            pastDate.setMonth(today.getMonth() - 24);
          } else if (card.issuer.toLowerCase() === 'amex') {
            pastDate.setMonth(today.getMonth() - 3);
          } else {
            pastDate.setMonth(today.getMonth() - 12);
          }
          appliedAt = pastDate.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        return {
          cardId: card.cardId,
          appliedAt,
        };
      });

      const constraints = {
        maxApplicationsPerMonth: 2,
        enforceLifetimeBonuses: true,
      };

      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCards,
          upcomingSpend,
          spendingCategory,
          applicationHistory,
          constraints,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Request failed');
      }

      const data = await res.json();
      setRecommendations(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // defaut issue date for the different cards
  const getDefaultDateNote = (issuer: string) => {
    const lower = issuer.toLowerCase();
    if (lower === 'chase') return 'Default: 24 months ago';
    if (lower === 'amex') return 'Default: 3 months ago';
    return 'Default: 12 months ago';
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Credit Card Optimizer</h1>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Estimated Upcoming Spend ($)</label>
        <input
          type="number"
          value={upcomingSpend}
          onChange={e => setUpcomingSpend(parseFloat(e.target.value))}
          className="border p-2 w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Spending Category</label>
        <select
          value={spendingCategory}
          onChange={e => setSpendingCategory(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="groceries">Groceries</option>
          <option value="travel">Travel</option>
          <option value="dining">Dining</option>
          <option value="gas">Gas</option>
          <option value="overall">overall</option>
        </select>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold mb-2">Your Current Cards</h2>
        <div className="flex gap-2 mb-2">
          <select
            value={selectedCardId}
            onChange={e => setSelectedCardId(e.target.value)}
            className="border p-2 w-1/2"
          >
            <option value="">Select a card</option>
            {availableCards.map(card => (
              <option key={card.cardId} value={card.cardId}>
                {card.name} ({card.issuer})
              </option>
            ))}
          </select>
          <input
            type="date"
            value={appliedDate}
            onChange={e => setAppliedDate(e.target.value)}
            className="border p-2 w-1/2"
            placeholder="YYYY-MM-DD"
          />
        </div>
        <small className="block mb-2 text-gray-500">
          * Leave date empty to use default applied date:<br /> 
          Chase (24 months ago), Amex (3 months ago), others (12 months ago)
        </small>
        <button
          onClick={addCard}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Card
        </button>

        <ul className="mt-2 list-disc list-inside text-sm">
          {currentCards.map(card => (
            <li key={card.cardId} className="flex justify-between items-center">
              <span>
                {card.name} ({card.issuer}) – Applied:{' '}
                {card.appliedDate
                  ? card.appliedDate
                  : getDefaultDateNote(card.issuer)}
              </span>
              <button
                onClick={() => removeCard(card.cardId)}
                className="text-red-600 hover:underline ml-4"
                aria-label={`Remove ${card.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleOptimize}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? 'Optimizing...' : 'Get Recommendations'}
      </button>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      {recommendations.length > 0 && (
        <div className="mt-6">
          <h2 className="font-bold mb-2">Top Card Recommendations:</h2>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="border p-3 rounded bg-gray-50">
                <strong>{rec.card.name}</strong> ({rec.card.issuer})<br />
                Estimated Value: ${rec.expectedValue}<br />
                <em className="text-sm text-gray-600">{rec.reason}</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
