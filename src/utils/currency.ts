export type Currency = 'USD' | 'EUR' | 'CHF';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  rate: number;
}

const CURRENCY_RATES: Record<Currency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', rate: 1 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
  CHF: { code: 'CHF', symbol: 'CHF', rate: 0.88 }
};

const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

export function getCurrencyByCountry(countryCode: string): Currency {
  if (countryCode === 'CH') {
    return 'CHF';
  }
  if (EU_COUNTRIES.includes(countryCode)) {
    return 'EUR';
  }
  return 'USD';
}

export function convertPrice(usdPrice: number, currency: Currency): number {
  const rate = CURRENCY_RATES[currency].rate;
  return Math.round(usdPrice * rate);
}

export function formatPrice(price: number, currency: Currency): string {
  const info = CURRENCY_RATES[currency];
  if (currency === 'CHF') {
    return `${info.symbol} ${price}`;
  }
  return `${info.symbol}${price}`;
}

export async function detectUserCurrency(): Promise<Currency> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const countryCode = data.country_code;
    return getCurrencyByCountry(countryCode);
  } catch (error) {
    console.error('Failed to detect currency:', error);
    return 'USD';
  }
}
