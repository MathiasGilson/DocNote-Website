import type { Locale } from './i18n';
import { defaultLocale } from './i18n';

type JsonModule = { default: unknown };

const patientModules = import.meta.glob('../content/inline/patient/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const sondageModules = import.meta.glob('../content/inline/sondage/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const emploiModules = import.meta.glob('../content/inline/emploi/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const pillarsModules = import.meta.glob('../content/inline/pillars/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const landingsModules = import.meta.glob('../content/inline/landings/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const pillarNavModules = import.meta.glob('../content/inline/pillar-nav/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;
const seoModules = import.meta.glob('../content/inline/seo/*.json', { eager: true }) as Record<
  string,
  JsonModule
>;

function localeFromPath(path: string): string {
  const base = path.split('/').pop() || '';
  return base.replace(/\.json$/, '');
}

function mapModules<T>(modules: Record<string, JsonModule>): Partial<Record<Locale, T>> & { en: T } {
  const out: Record<string, T> = {};
  for (const [path, mod] of Object.entries(modules)) {
    out[localeFromPath(path)] = (mod.default ?? mod) as T;
  }
  if (!out.en) throw new Error('Missing en.json in inline content bundle');
  return out as Partial<Record<Locale, T>> & { en: T };
}

export const patientCopy = mapModules<Record<string, unknown>>(patientModules);
export const sondageCopy = mapModules<Record<string, unknown>>(sondageModules);
export const emploiCopy = mapModules<Record<string, unknown>>(emploiModules);
export const pillarsCopy = mapModules<Record<string, unknown>>(pillarsModules);
export const landingsCopy = Object.keys(landingsModules).length
  ? mapModules<Record<string, unknown>>(landingsModules)
  : ({ en: {} } as Partial<Record<Locale, Record<string, unknown>>> & { en: Record<string, unknown> });
export const pillarNavCopy = mapModules<Record<string, string>>(pillarNavModules);
export const seoCopy = mapModules<Record<string, { title: string; description: string }>>(seoModules);

export function getInline<T>(
  bundle: Partial<Record<Locale, T>> & { en: T },
  locale: Locale
): T {
  return bundle[locale] ?? bundle[defaultLocale];
}
