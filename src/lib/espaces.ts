import { EspaceData } from "@/types/espace";
import { list, del } from "@vercel/blob";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "espaces");

// Vercel Blob defaults to caching a blob for a month at its CDN edge, and
// that cache is keyed on the URL alone (it ignores query strings). Since
// the espace JSON is overwritten in place at a stable URL on every save,
// a long cache means an edit can stay invisible to visitors for up to a
// month. 60 seconds is the shortest Blob allows — put() calls that write
// espaces/<slug>.json should pass `cacheControlMaxAge: ESPACE_JSON_CACHE_MAX_AGE`.
export const ESPACE_JSON_CACHE_MAX_AGE = 60;

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
      // No cache-busting needed here: the espace JSON is written with a
      // short cacheControlMaxAge (see the put() calls in the API routes),
      // so the Blob CDN itself never holds a stale copy for long. A
      // query-string cache-buster wouldn't help anyway — Vercel Blob's CDN
      // ignores the query string when computing its cache key.
      const res = await fetch(blob.url);
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
      // Plain fetch — this function is used from an ISR-cached page
      // (/espaces/[slug]) as well as force-dynamic routes. Forcing
      // cache: "no-store" here would opt the ISR page out of static
      // caching entirely, defeating the point of `revalidate`. Freshness
      // is instead guaranteed at the Blob layer via a short
      // cacheControlMaxAge on write (see the put() calls) — a
      // query-string cache-buster wouldn't help since Vercel Blob's CDN
      // ignores the query string when computing its cache key.
      const res = await fetch(jsonBlob.url);
      if (res.ok) return (await res.json()) as EspaceData;
    }
  } catch {
    // Blob not configured
  }

  return getEspaceBySlug(slug);
}

const OWN_BLOB_HOSTNAME_RE = /\.public\.blob\.vercel-storage\.com$/;

function isOwnBlobUrl(url: string): boolean {
  try {
    return OWN_BLOB_HOSTNAME_RE.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

function collectMediaUrls(data: EspaceData | null): Set<string> {
  if (!data) return new Set();
  return new Set(
    [
      ...(data.photos || []),
      data.videoUrl,
      data.floorPlanImage,
      ...(data.storyPhotos || []),
      ...(data.highlightPhotos || []),
      ...(data.neighborhoodPhotos || []),
    ].filter((url): url is string => !!url)
  );
}

/**
 * Deletes Blob files referenced by `before` but no longer referenced by
 * `after` — e.g. a photo removed or a video replaced in the admin form —
 * so they don't keep taking up (billed) storage forever. Best-effort: a
 * failed delete is logged but never blocks the save that triggered it.
 */
export async function pruneOrphanedMedia(before: EspaceData | null, after: EspaceData): Promise<void> {
  const beforeUrls = collectMediaUrls(before);
  const afterUrls = collectMediaUrls(after);
  const orphaned = Array.from(beforeUrls).filter((url) => !afterUrls.has(url) && isOwnBlobUrl(url));
  if (orphaned.length === 0) return;

  const results = await Promise.allSettled(orphaned.map((url) => del(url)));
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error("Failed to delete orphaned media blob:", orphaned[i], result.reason);
    }
  });
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
