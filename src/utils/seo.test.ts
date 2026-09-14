import { describe, expect, it } from 'vitest';
import { getDefaultAlternates } from './seo';

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
