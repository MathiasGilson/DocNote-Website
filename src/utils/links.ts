import { getLocalizedPath, type Locale } from './i18n';

/** Page de demande de démo, remplaçante du lien de prise de rendez-vous externe. */
export const demoRequestPath = (locale: Locale) => getLocalizedPath('/demo', locale);
export const APP_STORE_URL = 'https://apps.apple.com/ch/app/docnote-for-doctors/id6741168204?l=fr-FR';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.docnote&pli=1';
