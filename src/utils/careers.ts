import type { Locale } from './i18n';
import { emploiCopy, getInline } from './inline-content';

export const CAREER_JOB_SLUGS = ['digital-marketing-intern'] as const;
export type CareerJobSlug = (typeof CAREER_JOB_SLUGS)[number];

export type CareersCopy = typeof emploiCopy.en & {
  jobShortLabel: string;
  vacanciesCount: string;
  selectRoleHint: string;
  currentRole: string;
  cvDrop: string;
  cvBrowse: string;
  applyFor: string;
  heroEyebrow: string;
  heroCta: string;
  whyTitle: string;
  whyBody: string;
  whyPoints: string[];
  cultureTitle: string;
  cultureBody: string;
  benefitsTitle: string;
  benefits: string[];
  rolesTitle: string;
  rolesSub: string;
  viewRole: string;
  backToCareers: string;
  closeModal: string;
  applyModalTitle: string;
};

export const getCareersCopy = (locale: Locale) => getInline(emploiCopy, locale) as CareersCopy;

export const getCareerVacancies = (t: CareersCopy) =>
  [
    {
      id: 'digital-marketing-intern' as const,
      shortLabel: t.jobShortLabel,
      title: t.jobTitle,
      location: t.location,
      type: t.type,
      aboutTitle: t.aboutTitle,
      aboutBody: t.aboutBody,
      contextTitle: t.contextTitle,
      contextBody: t.contextBody,
      missionsTitle: t.missionsTitle,
      missions: t.missions,
      profileTitle: t.profileTitle,
      profile: t.profile,
      conditionsTitle: t.conditionsTitle,
      conditions: t.conditions,
    },
  ] as const;

export const getCareerVacancy = (t: CareersCopy, slug: string) =>
  getCareerVacancies(t).find((job) => job.id === slug);

export const isCareerJobSlug = (slug: string): slug is CareerJobSlug =>
  (CAREER_JOB_SLUGS as readonly string[]).includes(slug);
