# Remontée automatique des visites BizDev

Ce document explique comment brancher le Google Sheet des comptes rendus de
visite sur l'outil, pour que chaque ligne cochée soit automatiquement
reformulée par Gemini et proposée à validation dans l'admin
(`/admin/visites`).

## 1. Variables d'environnement (côté app, dans Vercel)

À ajouter dans les Environment Variables du projet Vercel (Production, et
Preview si besoin) :

| Variable               | Description                                              |
| ---------------------- | --------------------------------------------------------- |
| `GEMINI_API_KEY`       | Clé API Gemini (Google AI Studio ou Vertex AI)             |
| `GEMINI_MODEL`         | Optionnel, défaut `gemini-2.5-flash`                       |
| `SHEETS_WEBHOOK_SECRET`| Un secret choisi par vous, partagé avec le script Apps Script ci-dessous |

## 2. Script Apps Script (côté Google Sheet)

1. Ouvrir le Google Sheet des comptes rendus de visite.
2. Menu **Extensions > Apps Script**.
3. Coller le contenu de [`apps-script-visites.gs`](./apps-script-visites.gs) dans l'éditeur (remplacer le contenu par défaut), puis enregistrer.
4. Dans l'éditeur Apps Script, ouvrir l'icône **horloge** (Déclencheurs) dans le menu de gauche, puis **Ajouter un déclencheur** :
   - Fonction à exécuter : `onEditInstallable`
   - Source de l'événement : **Depuis la feuille de calcul**
   - Type d'événement : **Sur modification**
   - Enregistrer, puis autoriser le script quand Google le demande (première exécution).
5. Toujours dans l'éditeur Apps Script : **Paramètres du projet** (icône engrenage) > **Propriétés du script** > ajouter :
   - `WEBHOOK_URL` = `https://<votre-domaine>/api/visites/ingest`
   - `WEBHOOK_SECRET` = la même valeur que `SHEETS_WEBHOOK_SECRET` définie côté Vercel

## 3. Comportement

- Dès qu'une ligne a sa case **"Envoi CR Visite ?"** cochée, toute la ligne (Date, Mois, Année, Espaces, Arrondissement, Client, Sales, Broker, Nombre de visite, LOI, Feedbacks) est envoyée à l'app.
- L'app tente de reconnaître l'espace concerné à partir de la colonne **Espaces** (comparaison du nom, insensible à la casse et aux accents). Si aucune correspondance fiable n'est trouvée, la visite arrive quand même dans la file d'attente, avec l'espace à choisir manuellement.
- Gemini reformule les notes brutes de la colonne **Feedbacks** en un compte-rendu professionnel + une "suite donnée", à partir du contexte de la ligne (client, LOI, broker, arrondissement...).
- Si Gemini échoue (clé manquante, erreur réseau...), la visite arrive quand même dans la file d'attente avec les notes brutes telles quelles — rien n'est jamais perdu.
- Rien n'apparaît automatiquement sur le rapport public : chaque visite doit être validée (et peut être modifiée ou reformulée à nouveau) depuis **`/admin/visites`** avant publication.
- Recocher la case sur une ligne déjà envoyée mais pas encore validée met à jour la même entrée en attente (pas de doublon). Si elle a déjà été publiée, un nouvel envoi crée une nouvelle entrée en attente sans toucher à la visite déjà publiée.

## 4. Colonne optionnelle "Statut envoi"

Si vous ajoutez une colonne **"Statut envoi"** dans le Sheet, le script y écrira automatiquement un retour visuel ("Envoyé le ..." ou "Échec (...)") après chaque tentative d'envoi. Elle est facultative : sans elle, tout fonctionne, simplement sans retour visuel dans le Sheet.
