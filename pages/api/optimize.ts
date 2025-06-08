// pages/api/optimize.ts

import { NextApiRequest, NextApiResponse } from 'next';
import rawCards from '../../data/cards.json';
import { Card, Recommendation, ApplicationHistory, Constraints } from '../../types/types';

import { normalizeCardData } from '../../lib/normalize';
import { optimizeCards } from '../../lib/optimizer';

/**
 * API handler to provide credit card recommendations.
 *
 * Workflow:
 * 1. Normalize raw card data from JSON file.
 * 2. Parse and validate user input from the request body.
 * 3. Run optimization logic to get top card recommendations.
 * 4. Return the top 3 recommendations as JSON.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  // Extract parameters from request body
  const {
    currentCards,
    upcomingSpend,
    spendingCategory,
    applicationHistory,
    constraints,
  } = req.body;

  // Validate upcomingSpend
  if (!upcomingSpend || typeof upcomingSpend !== 'number' || upcomingSpend <= 0) {
    return res.status(400).json({ error: 'Invalid upcoming spend' });
  }

  // Validate applicationHistory: should be an array of { cardId: string, appliedAt: string }
  if (!Array.isArray(applicationHistory)) {
    return res.status(400).json({ error: 'Invalid application history format' });
  }

  // Validate constraints object presence (optional, can be extended)
  if (!constraints) {
    return res.status(400).json({ error: 'Constraints object is required' });
  }

  try {
    // Normalize raw cards JSON data once per request
    const allCards: Card[] = normalizeCardData(rawCards);

    // Run optimizer function with normalized card data and user inputs,
    // including application history and realistic constraints
    const recommendations: Recommendation[] = optimizeCards(
      currentCards || [],
      upcomingSpend,
      allCards,
      spendingCategory,
      applicationHistory,
      constraints
    );

    // Return top 3 recommendations as JSON
    return res.status(200).json(recommendations.slice(0, 3));
  } catch (error) {
    console.error('Error in optimize API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
