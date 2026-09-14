import { describe, expect, it } from 'vitest';
import { getLocaleFromUrl, getLocalizedPath, getPathWithoutLocale, nonDefaultLocales } from './i18n';

describe('nonDefaultLocales', () => {
  it('excludes en', () => {
    expect([...nonDefaultLocales].sort()).toEqual(['de', 'fr']);
  });
});

describe('getLocalizedPath', () => {
  it('leaves English unprefixed with a trailing slash', () => {
    expect(getLocalizedPath('/', 'en')).toBe('/');
    expect(getLocalizedPath('/pricing', 'en')).toBe('/pricing/');
    expect(getLocalizedPath('blog/soap-notes', 'en')).toBe('/blog/soap-notes/');
  });
  it('prefixes other locales', () => {
    expect(getLocalizedPath('/', 'fr')).toBe('/fr/');
    expect(getLocalizedPath('/pricing', 'de')).toBe('/de/pricing/');
  });
});

describe('getLocaleFromUrl', () => {
  it('detects prefixed locales', () => {
    expect(getLocaleFromUrl(new URL('https://docnote.care/fr/pricing/'))).toBe('fr');
  });
  it('falls back to en for unprefixed paths', () => {
    expect(getLocaleFromUrl(new URL('https://docnote.care/'))).toBe('en');
    expect(getLocaleFromUrl(new URL('https://docnote.care/pricing/'))).toBe('en');
  });
});

describe('getPathWithoutLocale', () => {
  it('strips a locale prefix and leaves other paths alone', () => {
    expect(getPathWithoutLocale('/fr/pricing/')).toBe('/pricing/');
    expect(getPathWithoutLocale('/pricing/')).toBe('/pricing/');
    expect(getPathWithoutLocale('/de/')).toBe('/');
  });
});
