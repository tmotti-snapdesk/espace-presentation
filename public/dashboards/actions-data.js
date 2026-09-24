/* ============================================================
   Actions commerciales — données partagées
   Utilisé par : marketing.html (bloc « Les actions par espaces »)
                 espace.html (page dédiée à chaque espace)
   Ce second Google Sheet est distinct de celui du reporting growth :
   il n'est lu que par ce bloc et par les pages espace.
   Une ligne du Sheet = un espace.
   ============================================================ */
window.SnapActions = (function () {
  "use strict";

  /* ---- 1. Connexion au Google Sheet des espaces ----
     gid : numéro de l'onglet (dans l'adresse, après « gid= »). Vide = premier onglet.
     Le Sheet doit être partagé en « Tout le monde avec le lien », rôle Lecteur. */
  const CONFIG = {
    fileId: "1-jtOh2OcprjvKZ8tKnKzDYn-KqfJ9M72JAzl8r-fgSI",
    gid: ""
  };

  /* ---- 2. Colonnes lues (lettre de colonne dans le Sheet) — les seules utilisées ---- */
  const COLS = {
    jours:       "A",   // nombre de jours sur le marché
    visites:     "D",   // nombre de visites
    nom:         "G",   // nom de l'espace
    prix:        "I",   // prix
    responsable: "R",   // responsable de l'espace
    mailLeads:   "W",   // date du dernier mail leads
    mailjet:     "X",   // date du dernier mail Mailjet
    linkedin:    "Y",   // date de la campagne LinkedIn
    broker:      "AA",  // date de diffusion broker
    panneau:     "AK"   // panneau oui / non
  };

  /* Actions datées : comptées dans « Les actions de la semaine » et dans les pages espace */
  const DATED_ACTIONS = [
    { key: "mailLeads", label: "Mail leads" },
    { key: "mailjet",   label: "Mail Mailjet" },
    { key: "linkedin",  label: "Campagne LinkedIn" },
    { key: "broker",    label: "Diffusion broker" }
  ];


  /* ---- utilitaires ---- */
  const colIndex = letters => letters.toUpperCase().split("").reduce((n, c) => n * 26 + (c.charCodeAt(0) - 64), 0) - 1;
  const norm = str => String(str || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  const slug = str => norm(str).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  function num(v) {
    const c = String(v == null ? "" : v).replace(/[\s  €]/g, "").replace(",", ".");
    if (!/^-?\d*\.?\d+$/.test(c)) return null;
    const f = parseFloat(c); return Number.isFinite(f) ? f : null;
  }
  function bool(v) {
    const n = norm(v);
    if (!n) return null;
    if (/^(oui|yes|y|x|1|true|vrai|ok|✓|✔)/.test(n)) return true;
    if (/^(non|no|n|0|false|faux|-|aucun)/.test(n)) return false;
    return null;
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
  function startOfWeek(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  /* 0 = semaine en cours (lundi → dimanche), 1 = semaine dernière, etc. */
  function weeksAgo(date, now) {
    if (!date) return null;
    return Math.round((startOfWeek(now) - startOfWeek(date)) / (7 * 864e5));
  }
  const sameMonth = (a, b) => !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  const fmtDate = d => d ? d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
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
  const sheetUrl = () => "https://docs.google.com/spreadsheets/d/" + CONFIG.fileId + "/edit" + (CONFIG.gid ? "#gid=" + CONFIG.gid : "");

  function sheetError(code, status) { const e = new Error(code); e.code = code; e.status = status; return e; }
  async function fetchRows() {
    const url = "https://docs.google.com/spreadsheets/d/" + CONFIG.fileId + "/export?format=csv" + (CONFIG.gid ? "&gid=" + CONFIG.gid : "") + "&_=" + Date.now();
    let r;
    try { r = await fetch(url, { cache: "no-store", credentials: "omit" }); }
    catch (e) { throw sheetError("network"); }
    const body = await r.text();
    /* Google répond par une page de connexion (HTML) quand le Sheet n'est pas partagé */
    if (!r.ok || /^\s*</.test(body)) throw sheetError(r.status === 404 ? "missing" : "denied", r.status);
    return parseCSV(body);
  }

  /* Une ligne est un espace si sa colonne G est remplie et qu'elle porte au moins un chiffre
     dans A (jours) ou D (visites) — ce qui écarte les lignes de titre et d'en-tête. */
  function toSpace(row, now) {
    const get = k => row[colIndex(COLS[k])] || "";
    const nom = get("nom");
    if (!nom) return null;
    const jours = num(get("jours")), visites = num(get("visites"));
    if (jours == null && visites == null && !parseDate(get("mailLeads")) && !parseDate(get("mailjet"))) return null;
    const sp = {
      id: slug(nom), nom: nom, jours: jours, visites: visites,
      prix: get("prix"), prixNum: num(get("prix")), responsable: get("responsable"),
      panneau: bool(get("panneau")), panneauRaw: get("panneau"), dated: {}
    };
    DATED_ACTIONS.forEach(a => {
      const raw = get(a.key), d = parseDate(raw);
      sp.dated[a.key] = { raw: raw, date: d, weeksAgo: weeksAgo(d, now), thisMonth: sameMonth(d, now) };
    });
    return sp;
  }

  let cache = null;
  function loadSpaces() {
    if (!cache) cache = fetchRows().then(rows => {
      const now = new Date(), seen = {};
      const spaces = [];
      rows.forEach(r => {
        const sp = toSpace(r, now);
        if (!sp) return;
        let id = sp.id, k = 2;
        while (seen[id]) id = sp.id + "-" + (k++);     /* deux espaces au même nom */
        seen[id] = 1; sp.id = id;
        spaces.push(sp);
      });
      return { status: "ok", spaces: spaces, readAt: now };
    });
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
    CONFIG: CONFIG, COLS: COLS, DATED_ACTIONS: DATED_ACTIONS,
    loadSpaces: loadSpaces, refresh: refresh, weekSummary: weekSummary,
    sheetUrl: sheetUrl, fmtDate: fmtDate,
    espaceUrl: s => "espace.html?e=" + encodeURIComponent(s.id)
  };
})();
