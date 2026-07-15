// 1. Créez une Google Sheet "Candidatures DocNote"
// 2. Extensions → Apps Script → collez ce fichier → Enregistrer
// 3. Déployer → Nouveau déploiement → Type: Application Web
//    - Exécuter en tant que: Moi
//    - Qui a accès: Tout le monde
// 4. Copiez l'URL du déploiement dans PUBLIC_GOOGLE_SHEETS_CAREERS_URL (.env)
// Les CV sont enregistrés dans Drive (dossier "DocNote Candidatures CV").

const SHEET_NAME = 'Candidatures';
const CV_FOLDER_NAME = 'DocNote Candidatures CV';

const HEADERS = [
  'Timestamp',
  'Score',
  'Prénom',
  'Nom',
  'Email',
  'Téléphone',
  'LinkedIn',
  'CV',
  'Présence Genève',
  'Date début',
  'Durée (mois)',
  'École',
  'Formation',
  'Niveau études',
  'Français',
  'Anglais',
  'Outils IA (1-5)',
  'Reply.io / Zapier',
  'Looker Studio',
  'Cold email',
  'Landing / funnel',
  'Communautés',
  'Vidéo LinkedIn',
  'Copywriting (1-5)',
  'A/B testing (1-5)',
  'Analyse data (1-5)',
  'Intérêt healthtech (1-5)',
  'Motivation',
  'Exemple campagne',
  'Pourquoi DocNote',
  'Source',
  'Poste',
];

const ensureSheet_ = () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
};

const ensureCvFolder_ = () => {
  const folders = DriveApp.getFoldersByName(CV_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(CV_FOLDER_NAME);
};

const saveCv_ = (data) => {
  if (!data.cvBase64 || !data.cvFileName) return '';
  const folder = ensureCvFolder_();
  const safeName = String(data.cvFileName).replace(/[^\w.\- ()\[\]]+/g, '_');
  const prefix = [data.firstName, data.lastName].filter(Boolean).join('_') || 'candidat';
  const fileName = `${prefix}_${Date.now()}_${safeName}`;
  const bytes = Utilities.base64Decode(data.cvBase64);
  const blob = Utilities.newBlob(bytes, data.cvMimeType || 'application/pdf', fileName);
  const file = folder.createFile(blob);
  return file.getUrl();
};

const doPost = (e) => {
  try {
    const data = JSON.parse(e.postData.contents);
    const cvUrl = saveCv_(data);
    const sheet = ensureSheet_();
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.score ?? '',
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phone || '',
      data.linkedin || '',
      cvUrl,
      data.genevaPresence || '',
      data.startDate || '',
      data.durationMonths || '',
      data.school || '',
      data.educationField || '',
      data.educationLevel || '',
      data.frenchLevel || '',
      data.englishLevel || '',
      data.aiTools || '',
      data.automationTools || '',
      data.lookerStudio || '',
      data.coldEmail || '',
      data.funnelLanding || '',
      data.communities || '',
      data.linkedinVideo || '',
      data.copywriting || '',
      data.abTesting || '',
      data.dataAnalysis || '',
      data.healthInterest || '',
      data.motivation || '',
      data.campaignExample || '',
      data.whyDocNote || '',
      data.source || '',
      data.position || 'Stage Digital Marketing',
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true, cvUrl })).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
};

const doGet = () =>
  ContentService.createTextOutput(
    JSON.stringify({ ok: true, message: 'DocNote careers endpoint ready' })
  ).setMimeType(ContentService.MimeType.JSON);
