export type Currency = 'USD' | 'EUR' | 'CHF';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
}

const CURRENCY_INFO: Record<Currency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$' },
  EUR: { code: 'EUR', symbol: '€' },
  CHF: { code: 'CHF', symbol: 'CHF' }
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

export function formatPrice(price: number, currency: Currency): string {
  const info = CURRENCY_INFO[currency];
  if (currency === 'CHF') {
    return `${info.symbol} ${price}`;
  }
  return `${info.symbol}${price}`;
}

// Map IANA timezones to currencies. Used as the primary signal because
// timezones are reported directly by the browser and don't suffer from the
// VPN / carrier-NAT / mislocated-IP problems that IP geolocation does.
const TIMEZONE_TO_CURRENCY: Record<string, Currency> = {
  // Switzerland
  'Europe/Zurich': 'CHF',
  'Europe/Busingen': 'CHF',
  // Eurozone
  'Europe/Paris': 'EUR',
  'Europe/Berlin': 'EUR',
  'Europe/Vienna': 'EUR',
  'Europe/Brussels': 'EUR',
  'Europe/Madrid': 'EUR',
  'Europe/Rome': 'EUR',
  'Europe/Amsterdam': 'EUR',
  'Europe/Luxembourg': 'EUR',
  'Europe/Lisbon': 'EUR',
  'Europe/Dublin': 'EUR',
  'Europe/Helsinki': 'EUR',
  'Europe/Athens': 'EUR',
  'Europe/Monaco': 'EUR',
  'Europe/Malta': 'EUR',
  'Europe/Tallinn': 'EUR',
  'Europe/Riga': 'EUR',
  'Europe/Vilnius': 'EUR',
  'Europe/Bratislava': 'EUR',
  'Europe/Ljubljana': 'EUR',
  'Europe/Andorra': 'EUR',
  'Atlantic/Canary': 'EUR',
};

export function getCurrencyByTimezone(): Currency | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_TO_CURRENCY[tz] ?? null;
  } catch {
    return null;
  }
}

export async function detectUserCurrency(): Promise<Currency> {
  // 1. Primary: browser timezone (reliable, offline, no API call).
  const fromTz = getCurrencyByTimezone();
  if (fromTz) return fromTz;

  // 2. Fallback: IP geolocation via ipapi.co. Only reached when the timezone
  //    isn't in our known-mapping (e.g. non-Eurozone EU countries, rest of world).
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const countryCode = data.country_code;
    return getCurrencyByCountry(countryCode);
  } catch (error) {
    console.error('Failed to detect currency via IP:', error);
    return 'USD';
  }
}
