/* ============================================================
   Actions par espaces — données partagées
   Utilisé par : marketing.html (bloc « Les actions par espaces »)
                 espace.html (page dédiée à chaque espace)
   Source : l'onglet « Copie du Pilotage » du Google Sheet de la Tour de
   contrôle (le même Sheet que le reporting growth), lu en lecture seule.
   Une ligne = un espace.
   ============================================================ */
window.SnapActions = (function () {
  "use strict";

  /* ---- 1. Onglet lu ---- */
  const CONFIG = {
    fileId: "1zyvdKCRUX79ZkoCZgl3dIaSYs8MRQyIto18bzfIo1SA",
    gid: "738116768"   // onglet « Copie du Pilotage »
  };

  /* ---- 2. Colonnes lues — les seules utilisées ----
     Repérées par leur titre (ligne d'en-tête), pas par leur lettre :
     déplacer une colonne dans le Sheet ne casse rien. */
  const FIELDS = [
    { key: "nom",         label: "Espace",                     re: /^espaces?$/ },
    { key: "jours",       label: "Jours sur le marché",        re: /(^nb|nombre).*j(ou)?rs?\b|jours? sur le marche/ },
    { key: "visites",     label: "Nombre de visites",          re: /^((nb|nombre)( de)? )?visites?(?! virtuelle)\b/ },
    { key: "prix",        label: "Prix",                       re: /^prix/ },
    { key: "responsable", label: "Responsable",                re: /^responsable/ },
    { key: "mailLeads",   label: "Dernier mail leads",         re: /mail.*leads?/ },
    { key: "mailjet",     label: "Dernier mail Mailjet",       re: /mailjet/ },
    { key: "linkedin",    label: "Campagne LinkedIn",          re: /^campagne.*linkedin/ },
    { key: "broker",      label: "Diffusion broker",           re: /^diffusion.*brokers?/ },
    { key: "panneau",     label: "Panneau",                    re: /panneaux?/ }
  ];

  /* Actions datées : comptées dans « Les actions de la semaine » */
  const DATED_ACTIONS = [
    { key: "mailLeads", label: "Mail leads" },
    { key: "mailjet",   label: "Mail Mailjet" },
    { key: "linkedin",  label: "Campagne LinkedIn" },
    { key: "broker",    label: "Diffusion broker" }
  ];

  /* ---- utilitaires ---- */
  const norm = str => String(str || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
  const slug = str => norm(str).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  function num(v) {
    const c = String(v == null ? "" : v).replace(/[\s  €]/g, "").replace(",", ".");
    if (!/^-?\d*\.?\d+$/.test(c)) return null;
    const f = parseFloat(c); return Number.isFinite(f) ? f : null;
  }
  /* Dates acceptées : 12/09/2026, 12/09/26, 12-09-2026, 2026-09-12 */
  function parseDate(v) {
    const s = String(v || "").trim();
    let m = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/.exec(s);
    if (m) { let y = +m[3]; if (y < 100) y += 2000; const d = new Date(y, +m[2] - 1, +m[1]); return isNaN(d) ? null : d; }
    m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
    if (m) { const d = new Date(+m[1], +m[2] - 1, +m[3]); return isNaN(d) ? null : d; }
    return null;
  }
  function bool(v) {
    const n = norm(v);
    if (!n || parseDate(n)) return null;
    if (/^(oui|yes|y|x|1|true|vrai|ok|done|fait|pose|✓|✔)(?![a-z0-9])/.test(n)) return true;
    if (/^(non|no|n|0|false|faux|-|aucun)(?![a-z0-9])/.test(n)) return false;
    return null;
  }
  function startOfWeek(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  /* 0 = semaine en cours (lundi → dimanche), 1 = semaine dernière, etc. */
  function weeksAgo(date, now) {
    if (!date) return null;
    return Math.round((startOfWeek(now) - startOfWeek(date)) / (7 * 864e5));
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
  const sheetUrl = () => "https://docs.google.com/spreadsheets/d/" + CONFIG.fileId + "/edit#gid=" + CONFIG.gid;

  function sheetError(code, status) { const e = new Error(code); e.code = code; e.status = status; return e; }
  async function fetchRows() {
    const url = "https://docs.google.com/spreadsheets/d/" + CONFIG.fileId + "/export?format=csv&gid=" + CONFIG.gid + "&_=" + Date.now();
    let r;
    try { r = await fetch(url, { cache: "no-store", credentials: "omit" }); }
    catch (e) { throw sheetError("network"); }
    const body = await r.text();
    if (!r.ok) throw sheetError(r.status === 400 ? "missing_tab" : r.status === 404 ? "missing" : "denied", r.status);
    if (/^\s*</.test(body)) throw sheetError("denied", r.status);
    return parseCSV(body);
  }

  /* En-tête = première ligne contenant une colonne « Espace ».
     Espaces = les lignes qui suivent, jusqu'à la première ligne vide
     (le bloc « en commercialisation » ; off-market et libérations viennent après). */
  function parse(rows, now) {
    const h = rows.findIndex(r => r.some(c => /^espaces?$/.test(norm(c))));
    if (h < 0) throw sheetError("format");
    const head = rows[h].map(norm);
    const col = {};
    FIELDS.forEach(f => { const i = head.findIndex((c, ci) => f.re.test(c) && !Object.values(col).includes(ci)); if (i >= 0) col[f.key] = i; });
    const spaces = [];
    for (let r = h + 1; r < rows.length; r++) {
      const row = rows[r];
      if (row.every(c => !c)) { if (spaces.length) break; else continue; }
      const get = k => col[k] != null ? (row[col[k]] || "") : "";
      const nom = get("nom");
      if (!nom) continue;
      const sp = {
        id: slug(nom), nom: nom,
        jours: num(get("jours")), visites: num(get("visites")),
        prix: get("prix"), responsable: get("responsable"),
        panneau: bool(get("panneau")), panneauRaw: get("panneau"), dated: {}
      };
      DATED_ACTIONS.forEach(a => {
        const raw = get(a.key), d = parseDate(raw);   /* texte de la cellule, tel quel */
        sp.dated[a.key] = { raw: raw, date: d, weeksAgo: weeksAgo(d, now) };
      });
      spaces.push(sp);
    }
    /* même nom sur plusieurs lignes (ex. formats de postes) : identifiant unique + prix sur le bouton */
    const seen = {}, count = {};
    spaces.forEach(s => { count[s.nom] = (count[s.nom] || 0) + 1; });
    spaces.forEach(s => {
      let id = s.id, k = 2; while (seen[id]) id = s.id + "-" + (k++);
      seen[id] = 1; s.id = id;
      s.label = count[s.nom] > 1 && s.prix ? s.nom + " · " + s.prix : s.nom;
    });
    const missing = FIELDS.filter(f => col[f.key] == null).map(f => f.label);
    return { status: "ok", spaces: spaces, missing: missing, readAt: now };
  }

  let cache = null;
  function loadSpaces() {
    if (!cache) cache = fetchRows().then(rows => parse(rows, new Date()));
    cache.catch(() => { cache = null; });
    return cache;
  }
  function refresh() { cache = null; return loadSpaces(); }

  /* Graphique hebdo : pour chaque action datée, nombre d'espaces touchés cette semaine / la précédente */
  function weekSummary(spaces) {
    return DATED_ACTIONS.map(a => ({
      key: a.key, label: a.label,
      thisWeek: spaces.filter(s => s.dated[a.key].weeksAgo === 0).length,
      lastWeek: spaces.filter(s => s.dated[a.key].weeksAgo === 1).length
    }));
  }

  return {
    CONFIG: CONFIG, FIELDS: FIELDS, DATED_ACTIONS: DATED_ACTIONS,
    loadSpaces: loadSpaces, refresh: refresh, weekSummary: weekSummary, sheetUrl: sheetUrl,
    espaceUrl: s => "espace.html?e=" + encodeURIComponent(s.id)
  };
})();
