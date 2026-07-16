import type { Locale } from '../utils/i18n';

export const pillarSlugs = [
  'ai-medical-scribe',
  'hospital-documentation',
  'clinical-compliance',
] as const;

export type PillarSlug = (typeof pillarSlugs)[number];

type PillarCopy = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: { heading: string; body: string }[];
  ctaPrimary: string;
  ctaSecondary: string;
  relatedLabel: string;
};

export const pillars: Record<PillarSlug, Record<Locale, PillarCopy>> = {
  'ai-medical-scribe': {
    en: {
      title: 'AI medical scribe for doctors',
      description:
        'DocNote is an AI medical scribe for physicians and hospitals in Switzerland and Europe. Turn consultations into structured clinical notes in seconds. Swiss-hosted, FADP/GDPR compliant.',
      h1: 'AI medical scribe built for real clinical work',
      intro:
        'DocNote listens during the consultation, transcribes securely, and drafts the clinical document you need — consultation notes, discharge letters, ward-round notes or operative reports — so you spend less time typing and more time with patients.',
      sections: [
        {
          heading: 'What an AI medical scribe should do',
          body: 'A useful medical scribe is not a generic transcript. It must understand clinical structure, specialty language, and the documents your hospital or practice actually ships. DocNote is designed for that workflow: capture once, generate the right note type, then let the physician validate before anything reaches the EHR.',
        },
        {
          heading: 'Built for Switzerland and Europe',
          body: 'Unlike US-first ambient tools bolted onto European practice, DocNote is built around Swiss and European documentation habits, multilingual consultations, and strict health-data rules. Hosting stays in Switzerland. Health data is not used to train foundation models.',
        },
        {
          heading: 'From voice to validated note',
          body: 'Start a recording on mobile or web, finish the encounter, and review a structured draft in seconds. Edit, approve, and push into your usual process — including Mediway and SOKLE integrations where available, or Word templates that match your letterhead.',
        },
      ],
      ctaPrimary: 'Start free trial',
      ctaSecondary: 'See pricing',
      relatedLabel: 'Related guides',
    },
    fr: {
      title: 'Scribe IA médical pour médecins',
      description:
        'DocNote est un scribe IA médical pour médecins et hôpitaux en Suisse et en Europe. Transformez vos consultations en notes cliniques structurées. Hébergé en Suisse, conforme nLPD / RGPD.',
      h1: 'Le scribe IA médical pensé pour le soin réel',
      intro:
        'DocNote écoute pendant la consultation, transcrit de façon sécurisée et rédige le document clinique dont vous avez besoin — note de consultation, lettre de sortie, note de visite ou compte rendu opératoire — pour que vous passiez moins de temps à taper et plus de temps avec vos patients.',
      sections: [
        {
          heading: 'Ce qu’un scribe IA médical doit vraiment faire',
          body: 'Un bon scribe médical n’est pas une simple transcription. Il doit comprendre la structure clinique, le langage de spécialité et les documents que votre hôpital ou cabinet produit réellement. DocNote est conçu pour ce flux : capturer une fois, générer le bon type de note, puis laisser le médecin valider avant l’envoi au DPI.',
        },
        {
          heading: 'Conçu pour la Suisse et l’Europe',
          body: 'Contrairement aux outils ambient américains adaptés après coup, DocNote part des habitudes de documentation suisses et européennes, des consultations multilingues et des règles strictes sur les données de santé. Hébergement en Suisse. Les données de santé ne servent pas à entraîner des modèles de fondation.',
        },
        {
          heading: 'De la voix à la note validée',
          body: 'Démarrez un enregistrement sur mobile ou web, terminez la consultation, puis relisez un brouillon structuré en quelques secondes. Corrigez, validez, et poursuivez votre processus habituel — avec Mediway et SOKLE le cas échéant, ou vos modèles Word à en-tête.',
        },
      ],
      ctaPrimary: 'Essai gratuit',
      ctaSecondary: 'Voir les tarifs',
      relatedLabel: 'Guides associés',
    },
    de: {
      title: 'KI-Schreibassistent für Ärztinnen und Ärzte',
      description:
        'DocNote ist ein KI-Schreibassistent für Ärztinnen, Ärzte und Spitäler in der Schweiz und Europa. Konsultationen in strukturierte Notizen verwandeln. In der Schweiz gehostet, DSG-/DSGVO-konform.',
      h1: 'KI-Schreibassistent für den echten Klinikalltag',
      intro:
        'DocNote hört während der Konsultation zu, transkribiert sicher und entwirft das klinische Dokument, das Sie brauchen — Konsultationsnotiz, Austrittsbericht, Visitennotiz oder OP-Bericht — damit Sie weniger tippen und mehr Zeit für Patientinnen und Patienten haben.',
      sections: [
        {
          heading: 'Was ein medizinischer KI-Schreibassistent leisten muss',
          body: 'Ein nützlicher Schreibassistent ist kein generisches Transkript. Er muss klinische Struktur, Fachsprache und die Dokumente verstehen, die Ihre Praxis oder Ihr Spital wirklich ausstellt. DocNote ist dafür gebaut: einmal erfassen, den richtigen Notiztyp erzeugen, dann ärztlich validieren, bevor etwas ins KIS geht.',
        },
        {
          heading: 'Für die Schweiz und Europa gebaut',
          body: 'Anders als US-first Ambient-Tools, die nachträglich angepasst werden, richtet sich DocNote nach schweizerischen und europäischen Dokumentationsgewohnheiten, mehrsprachigen Konsultationen und strengen Gesundheitsdatenregeln. Hosting in der Schweiz. Gesundheitsdaten werden nicht zum Trainieren von Foundation Models genutzt.',
        },
        {
          heading: 'Von der Stimme zur validierten Notiz',
          body: 'Starten Sie die Aufnahme auf Mobile oder Web, beenden Sie die Konsultation und prüfen Sie in Sekunden einen strukturierten Entwurf. Korrigieren, freigeben und in Ihren üblichen Prozess überführen — inkl. Mediway und SOKLE wo verfügbar, oder Word-Vorlagen mit Ihrem Briefkopf.',
        },
      ],
      ctaPrimary: 'Kostenlos testen',
      ctaSecondary: 'Preise ansehen',
      relatedLabel: 'Verwandte Guides',
    },
  },
  'hospital-documentation': {
    en: {
      title: 'Hospital documentation with AI',
      description:
        'Hospital documentation AI for discharge letters, operative reports, ward rounds and day-hospital files. DocNote helps care teams document faster without leaving Swiss hosting or medical secrecy.',
      h1: 'Hospital documentation without the evening backlog',
      intro:
        'Hospital work is not a single ambulatory SOAP note. DocNote supports the documents that actually fill a clinician’s evening: discharge letters, operative reports, ward-round notes, and shared day-hospital files across caregivers.',
      sections: [
        {
          heading: 'Documents hospitals actually need',
          body: 'Generate structured drafts for high-volume hospital outputs, then review and validate before they enter the patient record. Custom Word templates keep your institutional layout, signature block and section order.',
        },
        {
          heading: 'Day-hospital collaboration',
          body: 'When several professionals see the same patient in sequence, DocNote can support a shared file so contributions become one coherent record instead of fragmented notes.',
        },
        {
          heading: 'EHR-ready workflows',
          body: 'Integrate with systems such as Mediway and SOKLE, or export into your existing hospital process. The physician remains responsible for the final validated document.',
        },
      ],
      ctaPrimary: 'Talk to hospitals team',
      ctaSecondary: 'Watch tutorial',
      relatedLabel: 'Related guides',
    },
    fr: {
      title: 'Documentation hospitalière par IA',
      description:
        'Documentation hospitalière IA pour lettres de sortie, comptes rendus opératoires, notes de visite et dossiers HDJ. DocNote accélère la rédaction sans quitter l’hébergement suisse ni le secret médical.',
      h1: 'Documentation hospitalière sans backlog du soir',
      intro:
        'Le travail hospitalier ne se limite pas à une note SOAP ambulatoire. DocNote couvre les documents qui remplissent réellement les soirées des soignants : lettres de sortie, comptes rendus opératoires, notes de visite et dossiers d’hôpital de jour partagés.',
      sections: [
        {
          heading: 'Les documents dont l’hôpital a vraiment besoin',
          body: 'Générez des brouillons structurés pour les productions hospitalières à fort volume, puis relisez et validez avant le dossier patient. Les modèles Word personnalisés conservent votre mise en page institutionnelle, votre signature et l’ordre des sections.',
        },
        {
          heading: 'Collaboration en hôpital de jour',
          body: 'Lorsque plusieurs professionnels voient le même patient à la suite, DocNote peut soutenir un dossier partagé pour fusionner les contributions en un compte rendu cohérent plutôt qu’en notes fragmentées.',
        },
        {
          heading: 'Flux prêts pour le DPI',
          body: 'Intégrez Mediway et SOKLE, ou exportez dans votre processus hospitalier existant. Le médecin reste responsable du document final validé.',
        },
      ],
      ctaPrimary: 'Parler à l’équipe hôpitaux',
      ctaSecondary: 'Voir le tutoriel',
      relatedLabel: 'Guides associés',
    },
    de: {
      title: 'Spitaldokumentation mit KI',
      description:
        'KI für Spitaldokumentation: Austrittsberichte, OP-Berichte, Visitennotizen und Tagesklinik-Akten. DocNote beschleunigt die Dokumentation bei Schweizer Hosting und Arztgeheimnis.',
      h1: 'Spitaldokumentation ohne Abendstau',
      intro:
        'Spitalarbeit ist nicht nur eine ambulante SOAP-Notiz. DocNote unterstützt die Dokumente, die den Abend wirklich füllen: Austrittsberichte, OP-Berichte, Visitennotizen und gemeinsame Tagesklinik-Akten.',
      sections: [
        {
          heading: 'Dokumente, die Spitäler wirklich brauchen',
          body: 'Erzeugen Sie strukturierte Entwürfe für hochvolumige Spitaldokumente und validieren Sie sie vor dem Eintrag in die Patientenakte. Eigene Word-Vorlagen behalten Layout, Signaturblock und Abschnittsreihenfolge Ihrer Institution.',
        },
        {
          heading: 'Zusammenarbeit in der Tagesklinik',
          body: 'Wenn mehrere Fachpersonen denselben Patienten nacheinander sehen, kann DocNote eine gemeinsame Akte unterstützen, damit Beiträge zu einem kohärenten Bericht werden statt zu fragmentierten Notizen.',
        },
        {
          heading: 'KIS-taugliche Abläufe',
          body: 'Integrieren Sie Mediway und SOKLE oder exportieren Sie in Ihren bestehenden Spitalprozess. Die Ärztin oder der Arzt bleibt für das final validierte Dokument verantwortlich.',
        },
      ],
      ctaPrimary: 'Spital-Team kontaktieren',
      ctaSecondary: 'Tutorial ansehen',
      relatedLabel: 'Verwandte Guides',
    },
  },
  'clinical-compliance': {
    en: {
      title: 'Clinical AI compliance (FADP, GDPR, HIPAA)',
      description:
        'How DocNote handles clinical AI compliance: Swiss hosting, encryption, short audio retention, medical secrecy, FADP/nFADP, GDPR, HIPAA and ISO 27001 controls for hospitals and practices.',
      h1: 'Clinical AI that can survive a compliance review',
      intro:
        'Hospitals do not adopt ambient documentation on features alone. DocNote is built so security, retention and medical secrecy are part of the product story — not an afterthought slide.',
      sections: [
        {
          heading: 'Swiss hosting and encryption',
          body: 'Health data is hosted in Switzerland with strong encryption in transit and at rest. DocNote is designed to operate under medical secrecy expectations applicable to clinical auxiliaries.',
        },
        {
          heading: 'Short retention by design',
          body: 'Audio used to produce documentation is deleted automatically within a short window after processing. The lasting record is the physician-validated clinical document in your own systems.',
        },
        {
          heading: 'Standards that matter to buyers',
          body: 'DocNote aligns with FADP/nFADP, GDPR, HIPAA and ISO 27001 expectations buyers ask about in security questionnaires — and publishes a clear privacy policy for patients and institutions.',
        },
      ],
      ctaPrimary: 'Read privacy policy',
      ctaSecondary: 'Contact us',
      relatedLabel: 'Related guides',
    },
    fr: {
      title: 'Conformité IA clinique (nLPD, RGPD, HIPAA)',
      description:
        'Comment DocNote gère la conformité IA clinique : hébergement suisse, chiffrement, rétention audio courte, secret médical, nLPD, RGPD, HIPAA et ISO 27001 pour hôpitaux et cabinets.',
      h1: 'Une IA clinique qui tient face à un audit',
      intro:
        'Les hôpitaux n’adoptent pas la documentation ambient sur les seules fonctionnalités. DocNote est conçu pour que sécurité, rétention et secret médical fassent partie du produit — pas d’une slide oubliée.',
      sections: [
        {
          heading: 'Hébergement suisse et chiffrement',
          body: 'Les données de santé sont hébergées en Suisse avec un chiffrement fort en transit et au repos. DocNote est pensé pour les exigences du secret médical applicables aux auxiliaires du médecin.',
        },
        {
          heading: 'Rétention courte par conception',
          body: 'L’audio utilisé pour produire la documentation est supprimé automatiquement dans un délai court après traitement. Le document durable est le compte rendu validé par le médecin dans vos systèmes.',
        },
        {
          heading: 'Les standards que demandent les acheteurs',
          body: 'DocNote s’aligne sur la nLPD, le RGPD, HIPAA et ISO 27001 — les points qui reviennent dans les questionnaires de sécurité — et publie une politique de confidentialité claire pour patients et institutions.',
        },
      ],
      ctaPrimary: 'Lire la politique de confidentialité',
      ctaSecondary: 'Nous contacter',
      relatedLabel: 'Guides associés',
    },
    de: {
      title: 'Klinische KI-Compliance (DSG, DSGVO, HIPAA)',
      description:
        'So erfüllt DocNote klinische KI-Compliance: Hosting in der Schweiz, Verschlüsselung, kurze Audio-Aufbewahrung, Arztgeheimnis, DSG, DSGVO, HIPAA und ISO 27001 für Spitäler und Praxen.',
      h1: 'Klinische KI, die einem Compliance-Review standhält',
      intro:
        'Spitäler wählen Ambient-Dokumentation nicht nur nach Features. DocNote ist so gebaut, dass Sicherheit, Aufbewahrung und Arztgeheimnis Teil des Produkts sind — nicht nur einer Folie.',
      sections: [
        {
          heading: 'Schweizer Hosting und Verschlüsselung',
          body: 'Gesundheitsdaten werden in der Schweiz gehostet und stark verschlüsselt übertragen und gespeichert. DocNote ist auf die Erwartungen des Arztgeheimnisses für ärztliche Hilfspersonen ausgelegt.',
        },
        {
          heading: 'Kurze Aufbewahrung by design',
          body: 'Audio zur Erstellung der Dokumentation wird nach der Verarbeitung automatisch innerhalb eines kurzen Fensters gelöscht. Das dauerhafte Dokument ist der ärztlich validierte Bericht in Ihren Systemen.',
        },
        {
          heading: 'Standards, die Einkäufer prüfen',
          body: 'DocNote richtet sich nach DSG, DSGVO, HIPAA und ISO 27001 — den Punkten in Security-Fragebögen — und veröffentlicht eine klare Datenschutzrichtlinie für Patientinnen, Patienten und Institutionen.',
        },
      ],
      ctaPrimary: 'Datenschutz lesen',
      ctaSecondary: 'Kontakt',
      relatedLabel: 'Verwandte Guides',
    },
  },
};

export const pillarNavLabel: Record<Locale, Record<PillarSlug, string>> = {
  en: {
    'ai-medical-scribe': 'AI medical scribe',
    'hospital-documentation': 'Hospital documentation',
    'clinical-compliance': 'Clinical compliance',
  },
  fr: {
    'ai-medical-scribe': 'Scribe IA médical',
    'hospital-documentation': 'Documentation hospitalière',
    'clinical-compliance': 'Conformité clinique',
  },
  de: {
    'ai-medical-scribe': 'KI-Schreibassistent',
    'hospital-documentation': 'Spitaldokumentation',
    'clinical-compliance': 'Klinische Compliance',
  },
};
