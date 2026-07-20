import { EspaceData } from "@/types/espace";
import { list } from "@vercel/blob";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "espaces");

export function getAllEspaces(): EspaceData[] {
  if (!fs.existsSync(DATA_DIR)) {
    return [];
  }

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const content = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    return JSON.parse(content) as EspaceData;
  });
}

/** Resolves every espace, checking Blob (production) then the local fallback. */
export async function resolveAllEspaces(): Promise<EspaceData[]> {
  const espaces: EspaceData[] = [];
  const seenSlugs = new Set<string>();

  try {
    const { blobs } = await list({ prefix: "espaces/" });
    for (const blob of blobs.filter((b) => b.pathname.endsWith(".json"))) {
      const res = await fetch(blob.url, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as EspaceData;
        espaces.push(data);
        seenSlugs.add(data.slug);
      }
    }
  } catch {
    // Blob not configured
  }

  for (const local of getAllEspaces()) {
    if (!seenSlugs.has(local.slug)) espaces.push(local);
  }

  return espaces;
}

export function getEspaceBySlug(slug: string): EspaceData | null {
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as EspaceData;
}

/** Resolves a single espace by slug, checking Blob (production) then the local fallback. */
export async function resolveEspaceBySlug(slug: string): Promise<EspaceData | null> {
  try {
    const { blobs } = await list({ prefix: `espaces/${slug}` });
    const jsonBlob = blobs.find((b) => b.pathname === `espaces/${slug}.json`);
    if (jsonBlob) {
      const res = await fetch(jsonBlob.url, { cache: "no-store" });
      if (res.ok) return (await res.json()) as EspaceData;
    }
  } catch {
    // Blob not configured
  }

  return getEspaceBySlug(slug);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

/**
 * Best-effort match of a free-text espace name (e.g. from the BizDev Google
 * Sheet) against known espaces, comparing normalized name and slug. Returns
 * null when no confident match is found \u2014 callers should let an admin pick
 * the espace manually in that case.
 */
export function matchEspaceByName(
  nameRaw: string,
  espaces: EspaceData[]
): EspaceData | null {
  const target = normalizeForMatch(nameRaw);
  if (!target) return null;
  return (
    espaces.find((e) => normalizeForMatch(e.name) === target) ||
    espaces.find((e) => normalizeForMatch(e.slug) === target) ||
    null
  );
}
