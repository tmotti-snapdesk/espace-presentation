import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { list, put } from "@vercel/blob";
import { JSON_BLOB_CACHE_MAX_AGE } from "@/lib/blobCache";
import { summarizeEspace, type EspaceSummary, type VisiteForSummary } from "@/lib/gemini";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Compte rendu général automatique d'un espace, pour la Tour de contrôle
 * (public/dashboards/espace.html).
 *
 * Source : onglet « Copie Visite » du Sheet de la Tour de contrôle (lisible
 * par lien), visites depuis le 01/01/2026 uniquement, colonne « Feedbacks ».
 * Le résumé est rédigé par Gemini puis mis en cache (Vercel Blob) avec une
 * empreinte des comptes rendus : il n'est refait que lorsqu'un compte rendu
 * de cet espace est ajouté ou modifié.
 */
const SHEET_ID = "1zyvdKCRUX79ZkoCZgl3dIaSYs8MRQyIto18bzfIo1SA";
const VISITS_GID = "1442027368"; // onglet « Copie Visite »
const SINCE = new Date(2026, 0, 1);
const SHEET_CACHE_MS = 30_000;
/** À incrémenter quand la consigne donnée à Gemini change : tous les résumés sont alors refaits. */
const PROMPT_VERSION = "2";

interface Stored {
  hash: string;
  visites: number;
  generatedAt: string;
  summary: EspaceSummary;
}

const norm = (s: string) =>
  String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const slug = (s: string) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parseCSV(text: string): string[][] {
  const src = text.replace(/\r\n?/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [], field = "", q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"') { if (src[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.map((r) => r.map((c) => c.trim()));
}

function parseDate(s: string): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(String(s || "").trim());
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return isNaN(d.getTime()) ? null : d;
}

let sheetCache: { rows: string[][]; at: number } | null = null;
async function visitRows(): Promise<string[][]> {
  if (sheetCache && Date.now() - sheetCache.at < SHEET_CACHE_MS) return sheetCache.rows;
  const res = await fetch(
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${VISITS_GID}`,
    { cache: "no-store" }
  );
  const body = await res.text();
  if (!res.ok || /^\s*</.test(body)) throw new Error(`sheet ${res.status}`);
  sheetCache = { rows: parseCSV(body), at: Date.now() };
  return sheetCache.rows;
}

/** Visites de l'espace depuis janvier 2026 ayant un commentaire, de la plus ancienne à la plus récente. */
function visitsFor(rows: string[][], espace: string): VisiteForSummary[] {
  const h = rows.findIndex((r) => r.some((c) => /^espaces?$/.test(norm(c))));
  if (h < 0) throw new Error("colonne « Espaces » introuvable");
  const head = rows[h].map(norm);
  const col = (re: RegExp) => head.findIndex((c) => re.test(c));
  const cDate = col(/^date$/), cEsp = col(/^espaces?$/), cClient = col(/^client$/),
    cSales = col(/^sales$/), cBroker = col(/^broker$/), cLoi = col(/^loi$/), cFb = col(/^feedbacks?$/);
  const out: { d: Date; v: VisiteForSummary }[] = [];
  for (let i = h + 1; i < rows.length; i++) {
    const r = rows[i];
    const d = parseDate(r[cDate]);
    const fb = (r[cFb] || "").trim();
    if (!d || d < SINCE || !fb || norm(r[cEsp]) !== norm(espace)) continue;
    out.push({
      d,
      v: { date: r[cDate], sales: r[cSales] || "", client: r[cClient] || "", broker: r[cBroker] || "", loi: r[cLoi] || "", feedback: fb },
    });
  }
  return out.sort((a, b) => a.d.getTime() - b.d.getTime()).map((x) => x.v);
}

const blobPath = (espace: string) => `espaces-cr/${slug(espace)}.json`;
async function readStored(espace: string): Promise<Stored | null> {
  try {
    const { blobs } = await list({ prefix: blobPath(espace) });
    const b = blobs.find((x) => x.pathname === blobPath(espace));
    if (!b) return null;
    const res = await fetch(b.url, { cache: "no-store" });
    return res.ok ? ((await res.json()) as Stored) : null;
  } catch {
    return null; // Blob non configuré
  }
}
async function writeStored(espace: string, data: Stored): Promise<void> {
  try {
    await put(blobPath(espace), JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: JSON_BLOB_CACHE_MAX_AGE,
    });
  } catch {
    // Blob non configuré : le résumé reste en mémoire sur cette instance
  }
}

const memory = new Map<string, Stored>();
const inFlight = new Map<string, Promise<Stored>>();

export async function GET(request: NextRequest) {
  const espace = (request.nextUrl.searchParams.get("espace") || "").trim();
  if (!espace) return NextResponse.json({ error: "espace manquant" }, { status: 400 });
  const key = slug(espace);

  let visites: VisiteForSummary[];
  try {
    visites = visitsFor(await visitRows(), espace);
  } catch (e) {
    console.error("CR espace — lecture Copie Visite :", e);
    return NextResponse.json({ error: "sheet_error" }, { status: 502 });
  }
  if (!visites.length) return NextResponse.json({ visites: 0, summary: null });

  const hash = createHash("sha256").update(PROMPT_VERSION + JSON.stringify(visites)).digest("hex").slice(0, 16);
  const cached = memory.get(key) || (await readStored(espace));
  if (cached && cached.hash === hash) {
    memory.set(key, cached);
    return NextResponse.json(cached, { headers: { "Cache-Control": "no-store" } });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      cached ? { ...cached, stale: true } : { error: "not_configured", visites: visites.length },
      { status: cached ? 200 : 503 }
    );
  }

  // Un seul appel Gemini à la fois par espace, même si plusieurs pages sont ouvertes
  let job = inFlight.get(key);
  if (!job) {
    job = summarizeEspace(espace, visites).then(async (summary) => {
      const data: Stored = { hash, visites: visites.length, generatedAt: new Date().toISOString(), summary };
      memory.set(key, data);
      await writeStored(espace, data);
      return data;
    });
    inFlight.set(key, job);
    job.finally(() => inFlight.delete(key)).catch(() => {});
  }
  try {
    return NextResponse.json(await job, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("CR espace — Gemini :", e);
    // En cas d'échec, on garde le dernier résumé connu plutôt que rien
    if (cached) return NextResponse.json({ ...cached, stale: true });
    // Code HTTP renvoyé par Gemini (ex. 400 clé invalide, 403 accès refusé, 429 quota) pour le diagnostic
    const m = /Gemini API error \((\d+)\) \[([^\]]+)\]/.exec(String(e));
    return NextResponse.json({ error: "gemini_error", code: m?.[1] || null, model: m?.[2] || null, visites: visites.length }, { status: 502 });
  }
}
