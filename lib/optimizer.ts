// lib/optimizer.ts

import { Card, Recommendation, ApplicationHistory, Constraints } from '../types/types';

/**
 * Main function to recommend credit cards to maximize reward points.
 * 
 * @param currentCards - List of cards the user currently holds.
 * @param upcomingSpend - Expected spending amount in the upcoming period.
 * @param allCards - List of all available cards to consider.
 * @param spendingCategory - Optional spending category for multiplier calculations.
 * @param applicationHistory - User's past card application history.
 * @param constraints - Rules and limits to enforce (e.g., issuer restrictions).
 * 
 * @returns Top 3 recommended cards with expected value and reasons.
 */
export function optimizeCards(
  currentCards: Card[],
  upcomingSpend: number,
  allCards: Card[],
  spendingCategory?: string,
  applicationHistory?: ApplicationHistory[],
  constraints?: Constraints
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const USD_TO_POINTS = 100;  // 1 USD = 100 points

  function countAppsInLastMonths(months: number): number {
    if (!applicationHistory) return 0;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    return applicationHistory.filter(entry => new Date(entry.appliedAt) > cutoffDate).length;
  }

  function countAppsForIssuer(issuer: string, months: number): number {
    if (!applicationHistory) return 0;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    return applicationHistory.filter(
      entry => entry.cardId.toLowerCase().startsWith(issuer.toLowerCase()) &&
               new Date(entry.appliedAt) > cutoffDate
    ).length;
  }

  function hasUsedLifetimeBonus(cardId: string): boolean {
    if (!constraints?.enforceLifetimeBonus) return false;
    if (!applicationHistory) return false;
    return applicationHistory.some(entry => entry.cardId === cardId);
  }

  for (const card of allCards) {

    // Skip if user already holds this card
    if (currentCards.some(c => c.cardId === card.cardId)) {
      continue;
    }

    // Enforce Chase 5/24 rule if enabled
    if (constraints?.enforceIssuerRules && card.issuer.toLowerCase() === 'chase') {
      const appsIn24Months = countAppsInLastMonths(24);
      if (appsIn24Months >= 5) continue;
    }

    // Enforce max applications per issuer within given months
    if (constraints?.maxAppsPerIssuerInMonths) {
      const issuerLimit = constraints.maxAppsPerIssuerInMonths[card.issuer.toLowerCase()];
      if (issuerLimit) {
        const appsCount = countAppsForIssuer(card.issuer, issuerLimit.months);
        if (appsCount >= issuerLimit.maxApps) {
          continue;
        }
      }
    }

    // Skip if lifetime bonus already used and enforcement is on
    if (hasUsedLifetimeBonus(card.cardId)) {
      continue;
    }

    // Check minimum spend requirement for any offer on the card
    const minSpend = card.offers.length > 0
      ? Math.min(...card.offers.map(o => o.spend))
      : 0;

    if (upcomingSpend < minSpend) continue;

    // Calculate maximum bonus amount available on the card (assumed points)
    const maxBonus = card.offers.length > 0
      ? Math.max(...card.offers.map(o => Math.max(...o.amount.map(a => a.amount))))
      : 0;

    // Determine cashback multiplier based on spending category or universal cashback (as decimal)
    let multiplier = 0.01; // Default 1%
    if (spendingCategory) {
      if (card.multipliers && card.multipliers[spendingCategory] !== undefined) {
        multiplier = card.multipliers[spendingCategory] / 100;
      } else if (card.universalCashbackPercent !== undefined) {
        multiplier = card.universalCashbackPercent / 100;
      }
    } else if (card.universalCashbackPercent !== undefined) {
      multiplier = card.universalCashbackPercent / 100;
    }

    // Calculate expected points from upcoming spend (USD -> points)
    const earnedPoints = upcomingSpend * multiplier * USD_TO_POINTS;

    // Calculate annual fee in points (USD -> points), waived if applicable
    const annualFeePoints = (card.isAnnualFeeWaived ? 0 : card.annualFee) * USD_TO_POINTS;

    // Total expected points = signup bonus + cashback points - annual fee points
    const totalPoints = maxBonus + earnedPoints - annualFeePoints;

    if (totalPoints <= 0) continue;
    const totalValue = totalPoints/USD_TO_POINTS
    recommendations.push({
      card,
      applyAfterMonths: 0,
      expectedValue: totalValue,
      reason: card.issuer.toLowerCase() === 'chase' && constraints?.enforceIssuerRules && countAppsInLastMonths(24) >= 5
        ? 'Blocked due to Chase 5/24 rule'
        : undefined
    });
  }

  // Return top 3 cards sorted by expected points descending
  return recommendations.sort((a, b) => b.expectedValue - a.expectedValue).slice(0, 3);
}
