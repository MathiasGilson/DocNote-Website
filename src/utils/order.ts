/**
 * The rules the purchase-order page enforces before it lets anything be signed.
 *
 * Kept apart from the page so they read as rules rather than as DOM handling, and deliberately a
 * restatement of what the backend already refuses (`order.logic.ts`). The server is the authority;
 * this is what stops a doctor discovering their mistake only after pressing sign.
 */

/**
 * Deliberately permissive: an address only has to look addressable.
 *
 * A stricter pattern rejects addresses that genuinely work — long or unusual top-level domains,
 * plus-tags, hospital intranets — and the cost of being wrong is asymmetric. Refusing a real doctor
 * loses an order; accepting a typo sends a purchase order into the void, which the buyer sees at once
 * because they are the one waiting for it.
 */
const EMAIL = /^[^\s@]+@[^\s@]+$/;

export function isEmail(value: string): boolean {
  return EMAIL.test(value.trim().toLowerCase());
}

export interface SeatIssues {
  invalid: string[];
  duplicates: string[];
  /** How many boxes are still empty. */
  missing: number;
}

/**
 * What is wrong with the addresses typed so far.
 *
 * A repeat is reported rather than removed: one licence per doctor, and silently dropping a duplicate
 * would leave the practice paying for a seat nobody holds.
 */
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
  };
}
