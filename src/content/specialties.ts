import type { Locale } from '../utils/i18n';
import type { BlogCategory } from './categories';

export const SPECIALTY_SLUGS = ['radiology'] as const;
export type SpecialtySlug = (typeof SPECIALTY_SLUGS)[number];

export type SpecialtyCopy = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  documents: { name: string; body: string }[];
  benefits: { heading: string; body: string }[];
  faq: { q: string; a: string }[];
  categories: BlogCategory[];
};

export const specialtyNavLabel: Record<Locale, Record<SpecialtySlug, string>> = {
  en: { radiology: 'DocNote for radiology' },
  fr: { radiology: 'DocNote pour la radiologie' },
  de: { radiology: 'DocNote für die Radiologie' },
};

export const specialties: Record<SpecialtySlug, Record<Locale, SpecialtyCopy>> = {
  radiology: {
    en: {
      title: 'AI radiology report dictation',
      description: 'Dictate radiology reports live with DocNote: realtime transcription, SpeechMike support, structured findings and RIS integration. Swiss-hosted, GDPR compliant.',
      h1: 'Radiology reports dictated live, structured in seconds',
      intro: 'DocNote radiology mode transcribes as you read the images, turns the dictation into a structured report with technique, findings and impression, and hands the text back to your RIS. It runs in the browser, works with a Philips SpeechMike, and never stores audio longer than needed to generate the report.',
      documents: [
        { name: 'CT and MRI reports', body: 'Structured by region with your own template, including comparison to prior exams when you mention them.' },
        { name: 'Ultrasound and X-ray', body: 'Short-form reports that keep your standard normal phrases and only expand where you dictate a finding.' },
        { name: 'Interventional procedure notes', body: 'Procedure, materials, complications and post-procedure instructions from one continuous dictation.' },
      ],
      benefits: [
        { heading: 'Realtime, not batch', body: 'Text appears while you speak, so you correct on the fly instead of proofreading a full report at the end.' },
        { heading: 'Hold-to-record on a SpeechMike', body: 'Push-to-talk on the device you already use. No new hardware, no bot joining a call.' },
        { heading: 'Embedded in your RIS', body: 'DocNote runs inside the RIS as a panel and returns the report through a standard message, so nothing is copied by hand.' },
        { heading: 'Swiss hosting, short retention', body: 'Audio and text are processed in Switzerland. Audio is deleted after the report is generated.' },
      ],
      faq: [
        { q: 'Does DocNote replace my radiology templates?', a: 'No. You import your existing templates and DocNote fills them from the dictation. Normal phrases stay exactly as you wrote them.' },
        { q: 'Which dictation microphones are supported?', a: 'Any microphone the browser can access, plus Philips SpeechMike push-to-talk on the web app through WebHID.' },
        { q: 'Can it run inside our RIS?', a: 'Yes. The web app can be embedded as an iframe and exchanges context and the finished report with the RIS through postMessage. Contact us for the integration guide.' },
        { q: 'Where is the data processed?', a: 'In Switzerland. DocNote is FADP, GDPR and HIPAA compliant and ISO 27001 certified. Health data is never used to train models.' },
      ],
      categories: ['specialties', 'guides'],
    },
    fr: {
      title: 'Dictée de comptes rendus de radiologie par IA',
      description: 'Dictez vos comptes rendus de radiologie en direct avec DocNote : transcription en temps réel, SpeechMike, intégration RIS. Hébergé en Suisse.',
      h1: 'Des comptes rendus de radiologie dictés en direct, structurés en quelques secondes',
      intro: 'Le mode radiologie de DocNote transcrit pendant que vous lisez les images, transforme la dictée en compte rendu structuré avec technique, résultats et conclusion, puis renvoie le texte à votre RIS. Il fonctionne dans le navigateur, avec un SpeechMike Philips, et ne conserve l’audio que le temps de générer le compte rendu.',
      documents: [
        { name: 'Comptes rendus de scanner et IRM', body: 'Structurés par région selon votre propre modèle, avec comparaison aux examens antérieurs si vous la dictez.' },
        { name: 'Échographie et radiographie', body: 'Comptes rendus courts qui conservent vos formules de normalité et ne se développent que sur les anomalies dictées.' },
        { name: 'Comptes rendus d’interventionnel', body: 'Procédure, matériel, complications et consignes post-intervention à partir d’une seule dictée continue.' },
      ],
      benefits: [
        { heading: 'En temps réel, pas en différé', body: 'Le texte apparaît pendant que vous parlez : vous corrigez au fil de l’eau au lieu de relire un compte rendu entier à la fin.' },
        { heading: 'Appui-pour-parler sur SpeechMike', body: 'Le bouton de l’appareil que vous utilisez déjà. Aucun nouveau matériel, aucun robot dans un appel.' },
        { heading: 'Intégré à votre RIS', body: 'DocNote s’ouvre dans le RIS sous forme de panneau et renvoie le compte rendu par un message standard : rien n’est recopié à la main.' },
        { heading: 'Hébergement suisse, rétention courte', body: 'L’audio et le texte sont traités en Suisse. L’audio est supprimé une fois le compte rendu généré.' },
      ],
      faq: [
        { q: 'DocNote remplace-t-il mes modèles de compte rendu ?', a: 'Non. Vous importez vos modèles existants et DocNote les remplit à partir de la dictée. Vos formules de normalité restent inchangées.' },
        { q: 'Quels micros de dictée sont compatibles ?', a: 'Tout micro accessible par le navigateur, ainsi que le SpeechMike Philips en appui-pour-parler sur l’application web via WebHID.' },
        { q: 'Peut-il fonctionner dans notre RIS ?', a: 'Oui. L’application web s’intègre en iframe et échange le contexte et le compte rendu final avec le RIS par postMessage. Contactez-nous pour le guide d’intégration.' },
        { q: 'Où sont traitées les données ?', a: 'En Suisse. DocNote est conforme nLPD, RGPD et HIPAA et certifié ISO 27001. Les données de santé ne servent jamais à entraîner des modèles.' },
      ],
      categories: ['specialties', 'guides'],
    },
    de: {
      title: 'KI-Diktat für radiologische Befunde',
      description: 'Radiologische Befunde live diktieren mit DocNote: Echtzeit-Transkription, SpeechMike, strukturierte Befunde, RIS-Integration. In der Schweiz gehostet.',
      h1: 'Radiologische Befunde live diktiert, in Sekunden strukturiert',
      intro: 'Der Radiologie-Modus von DocNote transkribiert, während Sie die Bilder befunden, wandelt das Diktat in einen strukturierten Befund mit Technik, Befund und Beurteilung um und gibt den Text an Ihr RIS zurück. Er läuft im Browser, funktioniert mit einem Philips SpeechMike und speichert Audio nur so lange, wie die Befunderstellung dauert.',
      documents: [
        { name: 'CT- und MRT-Befunde', body: 'Nach Region strukturiert mit Ihrer eigenen Vorlage, inklusive Vergleich mit Voraufnahmen, wenn Sie ihn diktieren.' },
        { name: 'Ultraschall und Röntgen', body: 'Kurzbefunde, die Ihre Normalformulierungen behalten und nur bei diktierten Auffälligkeiten ausführlicher werden.' },
        { name: 'Interventionelle Prozedurberichte', body: 'Prozedur, Material, Komplikationen und Anweisungen nach dem Eingriff aus einem durchgehenden Diktat.' },
      ],
      benefits: [
        { heading: 'Echtzeit statt Stapelverarbeitung', body: 'Der Text erscheint, während Sie sprechen. Sie korrigieren sofort, statt am Ende den ganzen Befund gegenzulesen.' },
        { heading: 'Push-to-Talk am SpeechMike', body: 'Die Taste des Geräts, das Sie bereits nutzen. Keine neue Hardware, kein Bot in einem Anruf.' },
        { heading: 'Eingebettet in Ihr RIS', body: 'DocNote läuft als Panel im RIS und liefert den Befund über eine Standardnachricht zurück. Nichts wird von Hand kopiert.' },
        { heading: 'Schweizer Hosting, kurze Aufbewahrung', body: 'Audio und Text werden in der Schweiz verarbeitet. Audio wird nach der Befunderstellung gelöscht.' },
      ],
      faq: [
        { q: 'Ersetzt DocNote meine Befundvorlagen?', a: 'Nein. Sie importieren Ihre bestehenden Vorlagen und DocNote füllt sie aus dem Diktat. Normalformulierungen bleiben exakt erhalten.' },
        { q: 'Welche Diktiermikrofone werden unterstützt?', a: 'Jedes Mikrofon, auf das der Browser zugreifen kann, sowie Philips SpeechMike Push-to-Talk in der Web-App über WebHID.' },
        { q: 'Läuft es in unserem RIS?', a: 'Ja. Die Web-App lässt sich als iframe einbetten und tauscht Kontext und fertigen Befund per postMessage mit dem RIS aus. Kontaktieren Sie uns für die Integrationsanleitung.' },
        { q: 'Wo werden die Daten verarbeitet?', a: 'In der Schweiz. DocNote ist DSG-, DSGVO- und HIPAA-konform und ISO 27001 zertifiziert. Gesundheitsdaten werden nie für das Training von Modellen verwendet.' },
      ],
      categories: ['specialties', 'guides'],
    },
  },
};
