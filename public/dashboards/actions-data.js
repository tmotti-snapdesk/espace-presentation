/* ============================================================
   Actions commerciales — données partagées
   Utilisé par : marketing.html (bloc « Les actions par espaces »)
                 espace.html (page dédiée à chaque espace)
   Ce second Google Sheet est distinct de celui du reporting growth :
   il n'est lu que par le graphique des actions et par les pages espace.
   ============================================================ */
window.SnapActions = (function () {
  "use strict";

  /* ---- 1. Connexion au Google Sheet des actions (à remplir) ----
     fileId    : l'identifiant du Sheet (dans son adresse, entre /d/ et /edit)
     weeksGid  : le numéro « gid » de l'onglet des actions de la semaine
     spacesGid : le numéro « gid » de l'onglet du suivi par espace
     Tant que fileId est vide, les pages affichent « en attente de données ». */
  const CONFIG = {
    fileId: "",
    weeksGid: "",
    spacesGid: ""
  };

  /* ---- 2. Les espaces (un bouton + une page chacun) ----
     id  : identifiant court, sans espace ni accent (sert dans l'adresse de la page)
     nom : nom affiché, et tel qu'écrit dans la colonne « Espace » du Sheet */
  const ESPACES = [
    // { id: "opera", nom: "Espace Opéra" },
  ];

  /* ---- 3. Indicateurs du graphique « Les actions de la semaine » ---- */
  const WEEK_METRICS = [
    { key: "mails",    label: "Mails envoyés",      re: /mail/ },
    { key: "clics",    label: "Clics sur les mails", re: /clic/ },
    { key: "calls",    label: "Calls",               re: /call|appel/ },
    { key: "visites",  label: "Visites",             re: /visite/ },
    { key: "panneaux", label: "Panneaux placés",     re: /panneau/ }
  ];

  /* ---- 4. Questions de la page espace, par thème ----
     type "bool"  : oui / non
     type "count" : un nombre */
  const SPACE_GROUPS = [
    { title: "Communication", items: [
      { key: "mail",      label: "Un mail a été envoyé ce mois-ci",   type: "bool",  re: /^mail/ },
      { key: "linkedin",  label: "Post LinkedIn",                     type: "bool",  re: /post.*(linkedin|lk)/ },
      { key: "instagram", label: "Post Instagram",                    type: "bool",  re: /post.*(instagram|insta)/ }
    ] },
    { title: "Prospection et demandes entrantes", items: [
      { key: "coldcall",  label: "Cold call",                         type: "bool",  re: /cold\s*call/ },
      { key: "prospect",  label: "Un prospect nous a contactés",      type: "bool",  re: /prospect/ },
      { key: "broker",    label: "Un broker nous a contactés",        type: "bool",  re: /broker/ },
      { key: "visites",   label: "Nombre de visites",                 type: "count", re: /visite/ }
    ] },
    { title: "Visibilité et publicité", items: [
      { key: "panneau",   label: "Panneau posé",                      type: "bool",  re: /panneau/ },
      { key: "meta",      label: "Pub Meta",                          type: "bool",  re: /meta|facebook/ },
      { key: "pubLk",     label: "Pub LinkedIn",                      type: "bool",  re: /pub.*(linkedin|lk)/ },
      { key: "gads",      label: "Google Ads",                        type: "bool",  re: /google/ }
    ] }
  ];

  /* ---- utilitaires ---- */
  const norm = str => String(str || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  const slug = str => norm(str).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  function num(v) {
    const c = String(v == null ? "" : v).replace(/[\s  ]/g, "").replace(",", ".");
    if (!/^-?\d*\.?\d+$/.test(c)) return null;
    const f = parseFloat(c); return Number.isFinite(f) ? f : null;
  }
  function bool(v) {
    const n = norm(v);
    if (!n) return null;
    if (/^(oui|yes|y|x|1|true|vrai|ok|fait|✓|✔)$/.test(n)) return true;
    if (/^(non|no|n|0|false|faux|-)$/.test(n)) return false;
    return num(n) != null ? num(n) > 0 : true;
  }
  function parseCSV(text) {
    const src = String(text).replace(/\r\n?/g, "\n");
    const rows = []; let row = [], field = "", q = false;
    for (let i = 0; i < src.length; i++) {
      const c = src[i];
      if (q) { if (c === '"') { if (src[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.map(r => r.map(c => c.trim()));
  }
  const connected = () => !!(CONFIG.fileId && CONFIG.weeksGid !== "" && CONFIG.spacesGid !== "");
  const sheetUrl = () => CONFIG.fileId ? "https://docs.google.com/spreadsheets/d/" + CONFIG.fileId + "/edit" : null;

  async function fetchTab(gid) {
    const url = "https://docs.google.com/spreadsheets/d/" + CONFIG.fileId + "/export?format=csv&gid=" + gid + "&_=" + Date.now();
    const r = await fetch(url, { cache: "no-store", credentials: "omit" });
    const body = await r.text();
    if (!r.ok || /^\s*</.test(body)) throw new Error("Sheet des actions illisible (" + r.status + ")");
    return parseCSV(body);
  }
  /* Repère la ligne d'en-tête : la première qui contient la colonne attendue */
  function headerIndex(rows, re) { return rows.findIndex(r => r.some(c => re.test(norm(c)))); }
  function mapColumns(head, defs, skip) {
    const cols = {};
    defs.forEach(d => {
      const i = head.findIndex((c, ci) => skip.indexOf(ci) < 0 && d.re.test(norm(c)));
      if (i >= 0) cols[d.key] = i;
    });
    return cols;
  }

  /* Onglet « semaines » : une ligne par semaine — Semaine | Mails envoyés | Clics | Calls | Visites | Panneaux */
  async function loadWeeks() {
    if (!connected()) return { status: "not_connected", weeks: [] };
    const rows = await fetchTab(CONFIG.weeksGid);
    const h = headerIndex(rows, /^semaine/);
    if (h < 0) throw new Error("colonne « Semaine » introuvable dans l'onglet des actions");
    const wCol = rows[h].findIndex(c => /^semaine/.test(norm(c)));
    const cols = mapColumns(rows[h], WEEK_METRICS, [wCol]);
    const weeks = [];
    for (let r = h + 1; r < rows.length; r++) {
      const label = rows[r][wCol];
      if (!label) continue;
      const values = {};
      WEEK_METRICS.forEach(m => { values[m.key] = cols[m.key] != null ? num(rows[r][cols[m.key]]) : null; });
      if (WEEK_METRICS.every(m => values[m.key] == null)) continue;
      weeks.push({ label: label, values: values });
    }
    return { status: "ok", weeks: weeks };
  }

  /* Onglet « espaces » : une ligne par espace et par mois — Espace | Mois | Mail | Post LinkedIn | … */
  async function loadSpace(nom) {
    if (!connected()) return { status: "not_connected", months: [] };
    const rows = await fetchTab(CONFIG.spacesGid);
    const h = headerIndex(rows, /^espaces?$/);
    if (h < 0) throw new Error("colonne « Espace » introuvable dans l'onglet des espaces");
    const head = rows[h];
    const eCol = head.findIndex(c => /^espaces?$/.test(norm(c)));
    const mCol = head.findIndex(c => /^(mois|periode|date)$/.test(norm(c)));
    const items = [].concat.apply([], SPACE_GROUPS.map(g => g.items));
    const cols = mapColumns(head, items, [eCol, mCol]);
    const months = [];
    for (let r = h + 1; r < rows.length; r++) {
      if (norm(rows[r][eCol]) !== norm(nom)) continue;
      const values = {};
      items.forEach(it => {
        const raw = cols[it.key] != null ? rows[r][cols[it.key]] : "";
        values[it.key] = it.type === "count" ? num(raw) : bool(raw);
      });
      months.push({ label: mCol >= 0 ? rows[r][mCol] || "—" : "—", values: values });
    }
    return { status: "ok", months: months };
  }

  return {
    CONFIG: CONFIG, ESPACES: ESPACES, WEEK_METRICS: WEEK_METRICS, SPACE_GROUPS: SPACE_GROUPS,
    connected: connected, sheetUrl: sheetUrl, loadWeeks: loadWeeks, loadSpace: loadSpace,
    espaceUrl: e => "espace.html?e=" + encodeURIComponent(e.id || slug(e.nom)),
    findEspace: id => ESPACES.find(e => (e.id || slug(e.nom)) === id) || null
  };
})();
