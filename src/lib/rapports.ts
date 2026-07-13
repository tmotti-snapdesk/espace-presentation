import { list, put, del } from "@vercel/blob";
import fs from "fs";
import path from "path";
import {
  RapportData,
  RapportMonthData,
  RapportDistribution,
  RapportVisite,
  SimilarEspace,
  emptyDistribution,
  sortMonthsDesc,
} from "@/types/rapport";
import { getAllEspaces } from "@/lib/espaces";

const DATA_DIR = path.join(process.cwd(), "data", "rapports");

/** Normalizes a raw request body into a `RapportMonthData` entry. */
export function normalizeRapportMonth(body: Record<string, unknown>): RapportMonthData {
  const distributionBody =
    (body.distribution as Partial<RapportDistribution>) || {};
  return {
    month: String(body.month || ""),
    monthlyBudget: (body.monthlyBudget as string) || "",
    targetedEmailingCount: parseInt(String(body.targetedEmailingCount ?? "0")) || 0,
    matchingFormsCount: parseInt(String(body.matchingFormsCount ?? "0")) || 0,
    preselectionCount: parseInt(String(body.preselectionCount ?? "0")) || 0,
    brokersListingActive: Boolean(body.brokersListingActive),
    brokersListingCount: parseInt(String(body.brokersListingCount ?? "450")) || 450,
    distribution: { ...emptyDistribution(), ...distributionBody },
    otherMarketingActions: Array.isArray(body.otherMarketingActions)
      ? (body.otherMarketingActions as string[]).filter(Boolean)
      : [],
    prospectionActions: Array.isArray(body.prospectionActions)
      ? (body.prospectionActions as string[]).filter(Boolean)
      : [],
    upcomingActions: Array.isArray(body.upcomingActions)
      ? (body.upcomingActions as string[]).filter(Boolean)
      : [],
    visites: Array.isArray(body.visites) ? (body.visites as RapportVisite[]) : [],
  };
}

/** Normalizes a raw request body into the general (non-monthly) rapport fields. */
export function normalizeRapportGeneral(
  body: Record<string, unknown>,
  espaceSlug: string,
  existing: RapportData | null
): Omit<RapportData, "months"> {
  const now = new Date().toISOString();
  return {
    espaceSlug,
    espaceName: (body.espaceName as string) || existing?.espaceName || "",
    espaceAddress: (body.espaceAddress as string) ?? existing?.espaceAddress ?? "",
    marketingStartDate:
      (body.marketingStartDate as string) ?? existing?.marketingStartDate ?? "",
    ownerName: (body.ownerName as string) ?? existing?.ownerName ?? "",
    intro: (body.intro as string) ?? existing?.intro ?? "",
    anonymizeVisitProspects: Boolean(body.anonymizeVisitProspects),
    recommendations: Array.isArray(body.recommendations)
      ? (body.recommendations as string[]).filter(Boolean)
      : [],
    similarEspaces: Array.isArray(body.similarEspaces)
      ? (body.similarEspaces as SimilarEspace[])
      : [],
    presentationUrl: (body.presentationUrl as string) || "",
    hiddenSections: Array.isArray(body.hiddenSections)
      ? (body.hiddenSections as string[]).filter((s): s is string => typeof s === "string")
      : [],
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
}

export function rapportBlobPath(espaceSlug: string): string {
  return `rapports/${espaceSlug}.json`;
}

/**
 * Shape of a rapport before the "un seul rapport par espace" migration: one
 * file per espace *per month*, stored as `rapports/{slug}-{month}.json`.
 */
interface LegacyRapportData {
  espaceSlug: string;
  espaceName: string;
  espaceAddress: string;
  marketingStartDate: string;
  month: string;
  ownerName: string;
  intro: string;
  monthlyBudget: string;
  targetedEmailingCount: number;
  matchingFormsCount: number;
  preselectionCount: number;
  brokersListingActive: boolean;
  brokersListingCount: number;
  distribution: RapportDistribution;
  otherMarketingActions: string[];
  prospectionActions: string[];
  upcomingActions: string[];
  anonymizeVisitProspects: boolean;
  visites: RapportVisite[];
  recommendations: string[];
  similarEspaces: SimilarEspace[];
  presentationUrl: string;
  hiddenSections: string[];
  createdAt: string;
  updatedAt: string;
}

function isLegacyRapport(data: unknown): data is LegacyRapportData {
  return !!data && typeof data === "object" && !Array.isArray((data as { months?: unknown }).months);
}

/**
 * Merges the old one-file-per-month rapports of an espace into the new
 * single-report shape (general info + one `RapportMonthData` per month).
 * Nothing is dropped: every legacy field lands either in the general info
 * (taken from the most recent month) or inside its month's entry.
 */
function mergeLegacyRapports(legacy: LegacyRapportData[]): RapportData {
  const sorted = [...legacy].sort((a, b) => b.month.localeCompare(a.month));
  const latest = sorted[0];
  const earliestCreatedAt = legacy
    .map((r) => r.createdAt)
    .filter(Boolean)
    .sort()[0];

  const months: RapportMonthData[] = sorted.map((r) => ({
    month: r.month,
    monthlyBudget: r.monthlyBudget,
    targetedEmailingCount: r.targetedEmailingCount,
    matchingFormsCount: r.matchingFormsCount,
    preselectionCount: r.preselectionCount,
    brokersListingActive: r.brokersListingActive,
    brokersListingCount: r.brokersListingCount,
    distribution: r.distribution,
    otherMarketingActions: r.otherMarketingActions,
    prospectionActions: r.prospectionActions,
    upcomingActions: r.upcomingActions,
    visites: r.visites,
  }));

  return {
    espaceSlug: latest.espaceSlug,
    espaceName: latest.espaceName,
    espaceAddress: latest.espaceAddress,
    marketingStartDate: latest.marketingStartDate,
    ownerName: latest.ownerName,
    intro: latest.intro,
    anonymizeVisitProspects: latest.anonymizeVisitProspects,
    recommendations: latest.recommendations,
    similarEspaces: latest.similarEspaces,
    presentationUrl: latest.presentationUrl,
    hiddenSections: latest.hiddenSections,
    createdAt: earliestCreatedAt || latest.createdAt,
    updatedAt: new Date().toISOString(),
    months: sortMonthsDesc(months),
  };
}

// ---- Local filesystem fallback (dev only) ----

function localLegacyFileNames(espaceSlug: string): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith(`${espaceSlug}-`) && f.endsWith(".json"));
}

function readLocalJson(fileName: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf-8"));
}

function getLocalRapport(espaceSlug: string): RapportData | null {
  const newPath = path.join(DATA_DIR, `${espaceSlug}.json`);
  if (fs.existsSync(newPath)) {
    return JSON.parse(fs.readFileSync(newPath, "utf-8")) as RapportData;
  }

  const legacyFiles = localLegacyFileNames(espaceSlug);
  if (legacyFiles.length === 0) return null;

  const legacyItems = legacyFiles
    .map((f) => readLocalJson(f))
    .filter(isLegacyRapport);
  if (legacyItems.length === 0) return null;

  const merged = mergeLegacyRapports(legacyItems);

  // Les anciens fichiers ne sont volontairement jamais supprimés : ils
  // deviennent simplement inutilisés (le fichier fusionné est trouvé en
  // premier lors des prochaines lectures). Ça garde la migration
  // trivialement réversible — un rollback du code retombe sur les anciens
  // fichiers intacts.
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(newPath, JSON.stringify(merged, null, 2));

  return merged;
}

function getAllLocalRapportSlugs(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  const slugs = new Set<string>();
  for (const file of fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))) {
    const base = file.replace(/\.json$/, "");
    // New format file: "{slug}.json" — legacy format: "{slug}-{month}.json"
    const legacyMatch = base.match(/^(.+)-\d{4}-\d{2}$/);
    slugs.add(legacyMatch ? legacyMatch[1] : base);
  }
  return Array.from(slugs);
}

// ---- Vercel Blob (production) ----

async function getBlobRapport(espaceSlug: string): Promise<RapportData | null> {
  try {
    const { blobs } = await list({ prefix: `rapports/${espaceSlug}` });

    const newBlob = blobs.find((b) => b.pathname === rapportBlobPath(espaceSlug));
    if (newBlob) {
      const res = await fetch(newBlob.url, { cache: "no-store" });
      if (res.ok) return (await res.json()) as RapportData;
    }

    const legacyBlobs = blobs.filter((b) => {
      const rest = b.pathname.slice("rapports/".length);
      return rest.startsWith(`${espaceSlug}-`) && rest.endsWith(".json");
    });
    if (legacyBlobs.length === 0) return null;

    const legacyItems: LegacyRapportData[] = [];
    for (const blob of legacyBlobs) {
      const res = await fetch(blob.url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (isLegacyRapport(data)) legacyItems.push(data);
      }
    }
    if (legacyItems.length === 0) return null;

    const merged = mergeLegacyRapports(legacyItems);

    // Les anciens blobs ne sont volontairement jamais supprimés : ils
    // deviennent simplement inutilisés (le blob fusionné est trouvé en
    // premier lors des prochaines lectures). Ça garde la migration
    // trivialement réversible — un rollback du déploiement retombe sur les
    // anciens blobs intacts.
    await put(rapportBlobPath(espaceSlug), JSON.stringify(merged, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return merged;
  } catch {
    return null; // Blob not configured
  }
}

/**
 * Resolves the single rapport of an espace, transparently merging any
 * legacy per-month rapports into the new shape (and persisting the merge)
 * on first access. Checks Blob first, then falls back to local JSON files.
 */
export async function resolveRapport(espaceSlug: string): Promise<RapportData | null> {
  const blobResult = await getBlobRapport(espaceSlug);
  if (blobResult) return blobResult;
  return getLocalRapport(espaceSlug);
}

/** Resolves every espace's rapport (used by the unfiltered rapports listing). */
export async function resolveAllRapports(): Promise<RapportData[]> {
  const slugs = new Set<string>();
  for (const espace of getAllEspaces()) slugs.add(espace.slug);
  for (const slug of getAllLocalRapportSlugs()) slugs.add(slug);

  try {
    const { blobs } = await list({ prefix: "rapports/" });
    for (const blob of blobs) {
      const match = blob.pathname.match(/^rapports\/(.+?)(?:-\d{4}-\d{2})?\.json$/);
      if (match) slugs.add(match[1]);
    }
  } catch {
    // Blob not configured
  }

  const rapports: RapportData[] = [];
  for (const slug of Array.from(slugs)) {
    const rapport = await resolveRapport(slug);
    if (rapport) rapports.push(rapport);
  }
  return rapports;
}

export async function saveRapport(rapport: RapportData): Promise<void> {
  const json = JSON.stringify(rapport, null, 2);
  try {
    await put(rapportBlobPath(rapport.espaceSlug), json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch {
    // Blob not configured — write locally instead
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, `${rapport.espaceSlug}.json`), json);
  }
}

export async function deleteRapport(espaceSlug: string): Promise<void> {
  try {
    const { blobs } = await list({ prefix: `rapports/${espaceSlug}` });
    for (const blob of blobs) await del(blob.url);
  } catch {
    // Blob not configured
  }
  const localPath = path.join(DATA_DIR, `${espaceSlug}.json`);
  if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
}
