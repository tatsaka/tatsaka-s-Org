import { Currency } from '../types';

export const formatCurrency = (amount: number, currency: Currency | string = 'MAD'): string => {
  const safeAmount = isNaN(amount) ? 0 : amount;
  const curr = (currency || 'MAD').toString().toUpperCase();
  
  if (curr === 'MAD') {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(safeAmount) + ' DH';
  }

  if (curr === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(safeAmount);
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(safeAmount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateString;
  }
};
