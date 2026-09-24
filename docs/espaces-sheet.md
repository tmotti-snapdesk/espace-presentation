# Lecture du Sheet « Pilotage Bizdev » par la Tour de contrôle

Le bloc « Les actions par espaces » (`/dashboards/marketing.html`) et les pages
espace (`/dashboards/espace.html`) lisent le Sheet **en lecture seule**, via la
route serveur `src/app/api/espaces-sheet/route.ts`.

- Le Sheet n'est **jamais modifié**, ni copié, et son partage ne change pas.
- Le serveur le lit avec le compte Google de son propriétaire, avec une
  autorisation limitée à la lecture (`spreadsheets.readonly`).
- Seules les colonnes A, D, G, I, R, W, X, Y, AA et AK sont transmises aux pages.
- Les pages relisent toutes les minutes ; le serveur interroge Google au plus
  toutes les 30 secondes.

## Mise en place (une seule fois, ~15 minutes)

### 1. Créer l'accès dans Google Cloud

1. Aller sur <https://console.cloud.google.com> avec le compte qui a accès au Sheet.
2. Créer un projet (ex. « Tour de contrôle »).
3. Menu **API et services → Bibliothèque** : activer **Google Sheets API**.
4. **API et services → Écran de consentement OAuth** : type **Interne**
   (réservé aux comptes @snapdesk.co), nom de l'application, e-mail, enregistrer.
   > Si « Interne » n'est pas proposé, choisir « Externe » puis **Publier
   > l'application** : en mode « Test », l'accès expire au bout de 7 jours.
5. **API et services → Identifiants → Créer des identifiants → ID client OAuth** :
   - Type : **Application Web**
   - URI de redirection autorisé : `https://developers.google.com/oauthplayground`
   - Noter l'**ID client** et le **Code secret du client**.

### 2. Obtenir le jeton de lecture

1. Ouvrir <https://developers.google.com/oauthplayground>.
2. Roue dentée en haut à droite → cocher **Use your own OAuth credentials** →
   coller l'ID client et le code secret.
3. Dans la case « Input your own scopes », coller :
   `https://www.googleapis.com/auth/spreadsheets.readonly` → **Authorize APIs**,
   se connecter avec le compte qui a accès au Sheet, accepter.
4. **Exchange authorization code for tokens** → copier le **Refresh token**.

### 3. Renseigner Vercel

Vercel → projet → **Settings → Environment Variables**, ajouter (Production) :

| Nom | Valeur |
| --- | --- |
| `GOOGLE_OAUTH_CLIENT_ID` | l'ID client |
| `GOOGLE_OAUTH_CLIENT_SECRET` | le code secret |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | le refresh token |

Puis **Deployments → Redeploy**. Le bloc se remplit tout seul.

## Messages affichés par les pages

| Message | Cause |
| --- | --- |
| « pas encore activée » | les 3 variables ne sont pas renseignées dans Vercel |
| « Google refuse la lecture » | jeton expiré ou révoqué → refaire l'étape 2 |
| « injoignable » | coupure passagère, nouvelle tentative chaque minute |
