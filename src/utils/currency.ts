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

// Fine-grained country detection via IANA timezone, used as a fallback when
// IP geolocation is unavailable. Extend this map whenever a new country gets
// country-specific pricing or Stripe links.
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Europe/Zurich': 'CH',
  'Europe/Busingen': 'CH',
  'Europe/Paris': 'FR',
};

export function getCountryByTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_TO_COUNTRY[tz] ?? null;
  } catch {
    return null;
  }
}

// Cache the IP lookup across callers on the same page load so pricing, FAQ
// and SeoContent share a single network round-trip.
let _ipLookup: Promise<{ country_code: string | null } | null> | null = null;
function fetchIpLocation(): Promise<{ country_code: string | null } | null> {
  if (_ipLookup) return _ipLookup;
  _ipLookup = fetch('https://ipapi.co/json/')
    .then((r) => r.json())
    .then((d) => ({ country_code: d?.country_code ?? null }))
    .catch(() => null);
  return _ipLookup;
}

// Country detection: IP first (real physical location, what billing should
// follow), browser timezone as fallback when the IP lookup fails. This matches
// user expectation that a Swiss user with a Paris-timezone laptop still sees
// Swiss pricing.
export async function detectUserCountry(): Promise<string | null> {
  const ip = await fetchIpLocation();
  if (ip?.country_code) return ip.country_code;
  return getCountryByTimezone();
}

export async function detectUserCurrency(): Promise<Currency> {
  // 1. Primary: IP geolocation. A Swiss user whose laptop timezone is stuck
  //    on Europe/Paris still gets CHF because the IP is Swiss.
  const ip = await fetchIpLocation();
  if (ip?.country_code) return getCurrencyByCountry(ip.country_code);

  // 2. Fallback: browser timezone, used only when the IP lookup fails
  //    (offline, blocked by ad blocker, rate-limited, etc.).
  const fromTz = getCurrencyByTimezone();
  if (fromTz) return fromTz;

  return 'USD';
}
