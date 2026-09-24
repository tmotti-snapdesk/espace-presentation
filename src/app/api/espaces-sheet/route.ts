import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Lecture seule du Google Sheet « Pilotage Bizdev » pour la Tour de contrôle
 * (public/dashboards/marketing.html et espace.html).
 *
 * Le Sheet reste privé et n'est jamais modifié : le serveur le lit avec le
 * compte Google de son propriétaire, via une autorisation limitée à la
 * lecture (scope spreadsheets.readonly). Seules les 10 colonnes utilisées
 * par les pages sont renvoyées ; toutes les autres sont vidées.
 *
 * Variables d'environnement (Vercel) — voir docs/espaces-sheet.md :
 *   GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN
 *   ESPACES_SHEET_ID (facultatif, sinon l'identifiant ci-dessous)
 */
const DEFAULT_SHEET_ID = "1-jtOh2OcprjvKZ8tKnKzDYn-KqfJ9M72JAzl8r-fgSI";
const RANGE = "A1:AK2000"; // premier onglet
const KEPT_COLUMNS = ["A", "D", "G", "I", "R", "W", "X", "Y", "AA", "AK"];
const WIDTH = 37; // A → AK
const CACHE_MS = 30_000; // au plus une lecture Google toutes les 30 s

const colIndex = (letters: string) =>
  letters.split("").reduce((n, c) => n * 26 + (c.charCodeAt(0) - 64), 0) - 1;
const KEPT = new Set(KEPT_COLUMNS.map(colIndex));

let token: { value: string; expiresAt: number } | null = null;
let cached: { rows: string[][]; readAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (token && Date.now() < token.expiresAt - 60_000) return token.value;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN || "",
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(`auth ${res.status} ${data.error || ""}`.trim());
  }
  token = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
  return token.value;
}

async function readSheet(): Promise<string[][]> {
  const id = process.env.ESPACES_SHEET_ID || DEFAULT_SHEET_ID;
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(id)}/values/${RANGE}` +
    "?valueRenderOption=FORMATTED_VALUE";
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${await accessToken()}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`sheets ${res.status}`);
  const data: { values?: unknown[][] } = await res.json();
  return (data.values || []).map((row) => {
    const out: string[] = new Array(WIDTH).fill("");
    row.forEach((v, i) => {
      if (i < WIDTH && KEPT.has(i)) out[i] = String(v ?? "").trim();
    });
    return out;
  });
}

export async function GET() {
  const configured =
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!configured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  try {
    if (!cached || Date.now() - cached.readAt > CACHE_MS) {
      cached = { rows: await readSheet(), readAt: Date.now() };
    }
    return NextResponse.json(
      { rows: cached.rows, readAt: cached.readAt },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Lecture Sheet espaces :", error);
    // En cas d'erreur passagère, on renvoie la dernière lecture valide si elle existe.
    if (cached) {
      return NextResponse.json(
        { rows: cached.rows, readAt: cached.readAt, stale: true },
        { headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json({ error: "google_error" }, { status: 502 });
  }
}
