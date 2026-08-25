/**
 * The rules the purchase-order page enforces before it lets anything be signed.
 *
 * Kept apart from the page so they read as rules rather than as DOM handling, and deliberately a
 * restatement of what the backend already refuses (`order.logic.ts`). The server is the authority;
 * this is what stops a doctor discovering their mistake only after pressing sign.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Reads a list of addresses however it was pasted — one per line out of a mail client, or a comma
 * separated run out of a spreadsheet.
 *
 * Repeats are KEPT. Removing one silently would buy the practice fewer licences than it paid for;
 * `seatIssues` surfaces it instead, so the buyer decides.
 */
export function parseSeatEmails(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
}

export interface SeatIssues {
  invalid: string[];
  duplicates: string[];
  /** How many addresses are still owed for the licences bought. */
  missing: number;
  /** How many were given beyond them. */
  extra: number;
}

export function seatIssues(emails: string[], quantity: number): SeatIssues {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const email of emails) {
    if (seen.has(email) && !duplicates.includes(email)) duplicates.push(email);
    seen.add(email);
  }

  return {
    invalid: emails.filter((email) => !EMAIL.test(email)),
    duplicates,
    missing: Math.max(0, quantity - emails.length),
    extra: Math.max(0, emails.length - quantity),
  };
}

/**
 * Whether the signature button may be pressed.
 *
 * The seat list must match the licences exactly by this point: the document about to be signed names
 * the addresses it covers.
 */
export function canSign(params: {
  termsAccepted: boolean;
  signerName: string;
  emails: string[];
  quantity: number;
}): boolean {
  if (!params.termsAccepted || !params.signerName.trim()) return false;

  const issues = seatIssues(params.emails, params.quantity);
  return issues.invalid.length === 0 && issues.duplicates.length === 0 && issues.missing === 0 && issues.extra === 0;
}

/** The same shape the purchase order prints, so the page and the PDF never quote differently. */
export function formatMoney(cents: number, currency: string): string {
  const [whole, frac] = (cents / 100).toFixed(2).split('.');
  return `${currency} ${whole.replace(/\B(?=(\d{3})+(?!\d))/g, "'")}.${frac}`;
}
