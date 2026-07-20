export const currencyLabels: Record<string, string> = {
  EGP: 'جنيه',
  SAR: 'ريال سعودي',
  USD: 'دولار',
}

export function formatCurrency(amount: number, currency: string) {
  return `${amount.toLocaleString('ar-EG')} ${currencyLabels[currency] ?? currency}`
}
