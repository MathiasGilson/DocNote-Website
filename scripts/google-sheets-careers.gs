// 1. Dans la Google Sheet → Extensions → Apps Script → remplace TOUT le code par ce fichier
// 2. Enregistrer (Ctrl/Cmd+S)
// 3. Déployer → Gérer les déploiements → Modifier (crayon)
//    OU Nouveau déploiement → Application Web
//    - Exécuter en tant que: Moi
//    - Qui a accès: Tout le monde
// 4. Déployer / Nouvelle version → copier l'URL .../exec

var SHEET_NAME = 'Candidatures';
var CV_FOLDER_NAME = 'DocNote Candidatures CV';
var SPREADSHEET_ID = '1luiy3hqfITzHHMk-_HHAKvnaMR1XQpDyLim7osNLyKg';

var HEADERS = [
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

function ensureSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function ensureCvFolder_() {
  var folders = DriveApp.getFoldersByName(CV_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(CV_FOLDER_NAME);
}

function saveCv_(data) {
  if (!data.cvBase64 || !data.cvFileName) return '';
  var folder = ensureCvFolder_();
  var safeName = String(data.cvFileName).replace(/[^\w.\- ()\[\]]+/g, '_');
  var prefix = [data.firstName, data.lastName].filter(Boolean).join('_') || 'candidat';
  var fileName = prefix + '_' + Date.now() + '_' + safeName;
  var bytes = Utilities.base64Decode(data.cvBase64);
  var blob = Utilities.newBlob(bytes, data.cvMimeType || 'application/pdf', fileName);
  var file = folder.createFile(blob);
  return file.getUrl();
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var cvUrl = saveCv_(data);
    var sheet = ensureSheet_();
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.score != null ? data.score : '',
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
    return ContentService.createTextOutput(JSON.stringify({ ok: true, cvUrl: cvUrl })).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, message: 'DocNote careers endpoint ready' })
  ).setMimeType(ContentService.MimeType.JSON);
}
