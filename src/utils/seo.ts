import { locales, type Locale } from './i18n';

export const SITE_URL = 'https://docnote.care';
export const OG_IMAGE = `${SITE_URL}/images/og-image.png`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  de: 'de_CH',
};

export const formatPageTitle = (title: string) => {
  const cleaned = title.replace(/\s*[|—–-]\s*DocNote\s*$/i, '').trim();
  if (/docnote/i.test(cleaned)) return cleaned;
  return `${cleaned} | DocNote`;
};

export const withTrailingSlash = (pathname: string) => {
  if (!pathname || pathname === '/') return '/';
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return path.endsWith('/') ? path : `${path}/`;
};

export const absoluteUrl = (pathname: string) =>
  new URL(withTrailingSlash(pathname), SITE_URL).href;

export const getOgLocale = (locale: Locale) => OG_LOCALES[locale];

export const buildBreadcrumbLd = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const getDefaultAlternates = (pathname: string): Record<Locale, string> => {
  const segments = pathname.split('/').filter(Boolean);
  const rest =
    segments.length > 0 && locales.includes(segments[0] as Locale)
      ? segments.slice(1).join('/')
      : segments.join('/');
  const suffix = rest ? `/${rest}` : '';
  return {
    en: absoluteUrl(`/en${suffix}`),
    fr: absoluteUrl(`/fr${suffix}`),
    de: absoluteUrl(`/de${suffix}`),
  };
};

type PageMeta = { title: string; description: string };

export const pageMeta: Record<
  'home' | 'pricing' | 'blog' | 'team' | 'tutorial' | 'contact' | 'privacy' | 'gtc',
  Record<Locale, PageMeta>
> = {
  home: {
    en: {
      title: 'AI Medical Documentation for Hospitals',
      description:
        'DocNote turns consultations into discharge letters, ward-round notes and operative reports. Swiss-hosted AI scribe for doctors and hospitals. FADP, GDPR, HIPAA and ISO 27001 compliant.',
    },
    fr: {
      title: 'Documentation médicale IA pour les hôpitaux',
      description:
        'DocNote transforme vos consultations en lettres de sortie, notes de visite et comptes rendus opératoires. Assistant IA hébergé en Suisse pour médecins et hôpitaux. Conforme nLPD, RGPD, HIPAA et ISO 27001.',
    },
    de: {
      title: 'KI-Dokumentation für Spitäler und Ärztinnen',
      description:
        'DocNote macht aus Konsultationen Austrittsberichte, Visitennotizen und OP-Berichte. Schweizer KI-Schreibassistent für Ärztinnen, Ärzte und Spitäler. DSG-, DSGVO-, HIPAA- und ISO-27001-konform.',
    },
  },
  pricing: {
    en: {
      title: 'Pricing',
      description:
        'DocNote pricing for individual physicians and hospitals. 30 free consultations, then Professional from CHF 99/month (yearly) or custom Enterprise. Swiss and EU billing.',
    },
    fr: {
      title: 'Tarifs',
      description:
        'Tarifs DocNote pour médecins indépendants et hôpitaux. 30 consultations offertes, puis Professional dès CHF 99/mois (annuel) ou Enterprise sur mesure. Facturation Suisse et Europe.',
    },
    de: {
      title: 'Preise',
      description:
        'DocNote-Preise für Einzelpraxen und Spitäler. 30 kostenlose Konsultationen, danach Professional ab CHF 99/Monat (jährlich) oder Enterprise nach Mass. Abrechnung Schweiz und Europa.',
    },
  },
  blog: {
    en: {
      title: 'News & insights',
      description:
        'DocNote news, research and insights on AI medical documentation, physician burnout, compliance and hospital workflows in Switzerland and Europe.',
    },
    fr: {
      title: 'Actualités et analyses',
      description:
        'Actualités DocNote, études et analyses sur la documentation médicale IA, le burnout des médecins, la conformité et les workflows hospitaliers en Suisse et en Europe.',
    },
    de: {
      title: 'Neuigkeiten & Einblicke',
      description:
        'DocNote-Neuigkeiten, Forschung und Einblicke zu KI-Dokumentation, Ärztinnen-Burnout, Compliance und Spital-Workflows in der Schweiz und Europa.',
    },
  },
  team: {
    en: {
      title: 'Team',
      description:
        'Meet the DocNote team: physicians and engineers building AI clinical documentation for hospitals in Switzerland and Europe.',
    },
    fr: {
      title: 'Équipe',
      description:
        "Découvrez l'équipe DocNote : médecins et ingénieurs qui construisent la documentation clinique IA pour les hôpitaux en Suisse et en Europe.",
    },
    de: {
      title: 'Team',
      description:
        'Das DocNote-Team: Ärztinnen, Ärzte und Engineers, die KI-Dokumentation für Spitäler in der Schweiz und Europa entwickeln.',
    },
  },
  tutorial: {
    en: {
      title: 'Tutorial',
      description:
        'Learn how to use DocNote: record consultations, generate clinical notes, customise templates and sync with your EHR.',
    },
    fr: {
      title: 'Tutoriel',
      description:
        'Apprenez à utiliser DocNote : enregistrer une consultation, générer des notes cliniques, personnaliser les modèles et synchroniser avec votre DPI.',
    },
    de: {
      title: 'Anleitung',
      description:
        'So nutzen Sie DocNote: Konsultationen aufnehmen, klinische Notizen erzeugen, Vorlagen anpassen und mit dem KIS synchronisieren.',
    },
  },
  contact: {
    en: {
      title: 'Contact',
      description:
        'Contact DocNote for hospital demos, Enterprise pricing or support. Reach Dr. Vincent Tan and Dr. Alice Gilson in Switzerland and France.',
    },
    fr: {
      title: 'Contact',
      description:
        'Contactez DocNote pour une démo hospitalière, un devis Enterprise ou du support. Dr Vincent Tan et Dre Alice Gilson, Suisse et France.',
    },
    de: {
      title: 'Kontakt',
      description:
        'Kontaktieren Sie DocNote für Spital-Demos, Enterprise-Preise oder Support. Dr. Vincent Tan und Dr. Alice Gilson in der Schweiz und Frankreich.',
    },
  },
  privacy: {
    en: {
      title: 'Privacy policy',
      description:
        'DocNote privacy policy: Swiss hosting, data retention, medical confidentiality and your rights under FADP/nFADP and GDPR.',
    },
    fr: {
      title: 'Politique de confidentialité',
      description:
        'Politique de confidentialité DocNote : hébergement suisse, rétention des données, secret médical et vos droits selon la nLPD et le RGPD.',
    },
    de: {
      title: 'Datenschutz',
      description:
        'Datenschutzrichtlinie von DocNote: Hosting in der Schweiz, Aufbewahrung, Arztgeheimnis und Ihre Rechte nach DSG und DSGVO.',
    },
  },
  gtc: {
    en: {
      title: 'Terms and conditions',
      description:
        'General terms and conditions for using the DocNote AI medical documentation platform.',
    },
    fr: {
      title: 'Conditions générales',
      description:
        "Conditions générales d'utilisation de la plateforme DocNote de documentation médicale par IA.",
    },
    de: {
      title: 'Allgemeine Geschäftsbedingungen',
      description:
        'Allgemeine Geschäftsbedingungen für die Nutzung der DocNote-Plattform zur KI-Dokumentation.',
    },
  },
};

export const getPageMeta = (
  page: keyof typeof pageMeta,
  locale: Locale
): PageMeta => pageMeta[page][locale];
