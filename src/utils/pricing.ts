/**
 * What a visitor is shown, and in which currency.
 *
 * Two tariffs exist in Stripe and only two: Swiss francs and euros. Everything else on this page is a
 * conversion shown for information, and the page says which currency the card is actually charged in
 * whenever the two differ. Displaying a figure we cannot charge, without saying so, would be a
 * promise the checkout then breaks.
 *
 * The rule, which is a commercial decision and not an arithmetic one:
 *   · Switzerland and Liechtenstein  → the Swiss tariff, in francs
 *   · the euro area                  → the French tariff, in euros
 *   · United States and the dollar   → the Swiss tariff, converted
 *   · everywhere else                → the French tariff, converted
 */

export type BaseTariff = 'ch' | 'eu';

/** The billed currency behind each tariff — the only two Stripe holds. */
export const BILLED_CURRENCY: Record<BaseTariff, 'CHF' | 'EUR'> = { ch: 'CHF', eu: 'EUR' };

/**
 * The advertised price per month, per tariff: `monthly` when billed monthly, `yearly` when billed for
 * a year. These are the figures Stripe charges (CHF 109 / 1'188 and EUR 79 / 828), so the page and
 * the invoice cannot drift apart.
 */
export const BASE_PRICES: Record<BaseTariff, { monthly: number; yearly: number }> = {
  ch: { monthly: 109, yearly: 99 },
  eu: { monthly: 79, yearly: 69 },
};

const EURO_COUNTRIES = [
  'AT', 'BE', 'HR', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU',
  'MT', 'NL', 'PT', 'SK', 'SI', 'ES', 'MC', 'AD', 'SM', 'VA', 'ME', 'XK',
];

/** Countries that bill in dollars, and therefore read from the Swiss tariff. */
const DOLLAR_COUNTRIES = ['US', 'PR', 'GU', 'VI', 'AS', 'MP', 'EC', 'SV', 'PA', 'TL', 'ZW'];

/**
 * Currencies we know how to show. A country we do not recognise falls back to euros rather than to a
 * guess — a wrong currency reads as a wrong price.
 */
const COUNTRY_CURRENCY: Record<string, string> = {
  GB: 'GBP', TH: 'THB', JP: 'JPY', CN: 'CNY', SG: 'SGD', HK: 'HKD', AU: 'AUD', NZ: 'NZD',
  CA: 'CAD', IN: 'INR', AE: 'AED', SA: 'SAR', IL: 'ILS', TR: 'TRY', ZA: 'ZAR', BR: 'BRL',
  MX: 'MXN', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON',
  BG: 'BGN', KR: 'KRW', MY: 'MYR', ID: 'IDR', PH: 'PHP', VN: 'VND', MA: 'MAD', TN: 'TND',
};

/**
 * Units of the target currency for one euro, and one line for the dollar against the franc.
 *
 * Hand-maintained on purpose: no exchange-rate service is called from a page that must render
 * instantly and identically for everyone, and a published price should not move on its own between
 * two visits. Rounded to the nearest sensible unit below, so small drift never shows.
 *
 * Rates as of 26.08.2026 — worth a glance whenever a currency moves sharply.
 */
const PER_EUR: Record<string, number> = {
  GBP: 0.85, THB: 38, JPY: 170, CNY: 8.2, SGD: 1.5, HKD: 9.1, AUD: 1.75, NZD: 1.9,
  CAD: 1.6, INR: 98, AED: 4.3, SAR: 4.4, ILS: 4.3, TRY: 47, ZAR: 21, BRL: 6.3,
  MXN: 21, SEK: 11.2, NOK: 11.7, DKK: 7.46, PLN: 4.3, CZK: 25, HUF: 395, RON: 5,
  BGN: 1.96, KRW: 1550, MYR: 5, IDR: 18500, PHP: 65, VND: 29000, MAD: 10.6, TND: 3.5,
};

const USD_PER_CHF = 1.25;

/** Currencies written without decimals, where a decimal figure would look like an error. */
const WHOLE_UNIT = ['JPY', 'KRW', 'IDR', 'VND', 'HUF', 'THB', 'INR', 'CLP', 'ISK'];

export function currencyForCountry(country: string | null): string {
  if (!country) return 'EUR';
  if (country === 'CH' || country === 'LI') return 'CHF';
  if (DOLLAR_COUNTRIES.includes(country)) return 'USD';
  if (EURO_COUNTRIES.includes(country)) return 'EUR';
  return COUNTRY_CURRENCY[country] ?? 'EUR';
}

/** Which of the two real tariffs a currency reads from. */
export function baseForCurrency(currency: string): BaseTariff {
  return currency === 'CHF' || currency === 'USD' ? 'ch' : 'eu';
}

/** Rounded so a converted price reads like a price, not like a conversion. */
function roundForDisplay(amount: number, currency: string): number {
  if (WHOLE_UNIT.includes(currency)) return Math.round(amount / 10) * 10;
  return Math.round(amount);
}

/**
 * A base amount, expressed in the visitor's currency.
 *
 * `amount` is in whole units of the base currency (francs or euros), which is how the advertised
 * prices are written.
 */
export function toLocalAmount(amount: number, currency: string): number {
  const base = baseForCurrency(currency);
  if (currency === BILLED_CURRENCY[base]) return amount;
  if (currency === 'USD') return roundForDisplay(amount * USD_PER_CHF, currency);

  const rate = PER_EUR[currency];
  return rate ? roundForDisplay(amount * rate, currency) : amount;
}

const SYMBOL: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF', JPY: '¥' };

export function formatLocalPrice(amount: number, currency: string): string {
  const symbol = SYMBOL[currency];
  const shown = WHOLE_UNIT.includes(currency) ? amount.toLocaleString('fr-CH').replace(/ | /g, "'") : String(amount);
  if (symbol === '€' || symbol === '$' || symbol === '£' || symbol === '¥') return `${symbol}${shown}`;
  return `${currency} ${shown}`;
}

/** True when the visitor is shown one currency and charged another — the page must say so. */
export function isConverted(currency: string): boolean {
  return currency !== BILLED_CURRENCY[baseForCurrency(currency)];
}
