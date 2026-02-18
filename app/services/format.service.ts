/**
 * SERVICE DE FORMATAGE
 * 
 * Centralise tout le formatage d'affichage.
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatPercent = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals = 0): string => {
  return value.toFixed(decimals);
};
