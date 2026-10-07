import { describe, expect, it } from 'vitest';
import { formatPageTitle, getDefaultAlternates } from './seo';

describe('getDefaultAlternates', () => {
  it('maps an English path to all locales', () => {
    expect(getDefaultAlternates('/pricing/')).toEqual({
      en: 'https://docnote.care/pricing/',
      fr: 'https://docnote.care/fr/pricing/',
      de: 'https://docnote.care/de/pricing/',
    });
  });
  it('maps a prefixed path to all locales', () => {
    expect(getDefaultAlternates('/de/team/').en).toBe('https://docnote.care/team/');
  });
  it('handles the home page', () => {
    expect(getDefaultAlternates('/fr/')).toEqual({
      en: 'https://docnote.care/',
      fr: 'https://docnote.care/fr/',
      de: 'https://docnote.care/de/',
    });
  });
});

describe('formatPageTitle', () => {
  it('appends the brand suffix', () => {
    expect(formatPageTitle('Pricing')).toBe('Pricing | DocNote');
  });
  it('drops the suffix when it would push the title over 70 characters', () => {
    const title = 'AI-Assisted Nursing Documentation Cuts Time and Boosts Efficiency';
    expect(formatPageTitle(title)).toBe(title);
  });
});
