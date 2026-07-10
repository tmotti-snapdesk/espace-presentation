/**
 * À coller dans le Google Sheet des comptes rendus de visite BizDev :
 * Extensions > Apps Script, coller ce fichier, enregistrer.
 *
 * Puis créer un trigger installable (obligatoire — un simple onEdit(e) ne
 * peut pas appeler UrlFetchApp) :
 *   Dans l'éditeur Apps Script > icône "horloge" (Déclencheurs) > Ajouter un
 *   déclencheur > Fonction: onEditInstallable > Source de l'événement:
 *   Depuis la feuille de calcul > Type d'événement: Sur modification.
 *   Autoriser le script quand Google le demande.
 *
 * Puis configurer les propriétés du script (Project Settings > Script
 * Properties, ou Fichier > Propriétés du projet > Propriétés du script) :
 *   WEBHOOK_URL    -> https://votre-domaine/api/visites/ingest
 *   WEBHOOK_SECRET -> la même valeur que SHEETS_WEBHOOK_SECRET côté serveur
 *
 * Comportement : dès que la case de la colonne "Envoi CR Visite ?" est
 * cochée sur une ligne, la ligne entière est envoyée à l'app pour
 * reformulation par Gemini et validation admin.
 */

function onEditInstallable(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    const checkboxCol = headers.indexOf("Envoi CR Visite ?") + 1;
    if (checkboxCol === 0) return; // colonne introuvable
    if (range.getColumn() !== checkboxCol) return; // pas la bonne colonne
    if (range.getRow() === 1) return; // ligne d'en-tête
    if (range.getValue() !== true) return; // décochée, on ignore

    const row = range.getRow();
    const rowValues = sheet.getRange(row, 1, 1, lastCol).getValues()[0];

    const payload = { rowRef: String(row) };
    headers.forEach(function (header, i) {
      if (header) payload[header] = rowValues[i];
    });

    const props = PropertiesService.getScriptProperties();
    const webhookUrl = props.getProperty("WEBHOOK_URL");
    const secret = props.getProperty("WEBHOOK_SECRET");
    if (!webhookUrl || !secret) {
      throw new Error(
        "WEBHOOK_URL / WEBHOOK_SECRET non configurés dans les Script Properties"
      );
    }

    const response = UrlFetchApp.fetch(webhookUrl, {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + secret },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    // Colonne optionnelle "Statut envoi" (à ajouter si vous voulez un retour
    // visuel dans le Sheet ; le script fonctionne aussi sans elle).
    const statusCol = headers.indexOf("Statut envoi") + 1;
    if (statusCol > 0) {
      const ok = response.getResponseCode() === 200;
      sheet
        .getRange(row, statusCol)
        .setValue(
          ok
            ? "Envoyé le " + new Date().toLocaleString("fr-FR")
            : "Échec (" + response.getResponseCode() + ") : " + response.getContentText()
        );
    }
  } catch (err) {
    Logger.log("Erreur onEditInstallable: " + err);
  }
}
