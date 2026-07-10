import { list, put, del } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { PendingVisite } from "@/types/visitePending";

const DATA_DIR = path.join(process.cwd(), "data", "visites-pending");

function blobPath(id: string): string {
  return `visites-pending/${id}.json`;
}

export async function getAllPendingVisites(): Promise<PendingVisite[]> {
  const results: PendingVisite[] = [];
  const seenIds = new Set<string>();

  try {
    const { blobs } = await list({ prefix: "visites-pending/" });
    for (const blob of blobs.filter((b) => b.pathname.endsWith(".json"))) {
      const res = await fetch(blob.url, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as PendingVisite;
        results.push(data);
        seenIds.add(data.id);
      }
    }
  } catch {
    // Blob not configured
  }

  if (fs.existsSync(DATA_DIR)) {
    for (const file of fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))) {
      const data = JSON.parse(
        fs.readFileSync(path.join(DATA_DIR, file), "utf-8")
      ) as PendingVisite;
      if (!seenIds.has(data.id)) results.push(data);
    }
  }

  return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPendingVisite(id: string): Promise<PendingVisite | null> {
  try {
    const { blobs } = await list({ prefix: blobPath(id) });
    const jsonBlob = blobs.find((b) => b.pathname === blobPath(id));
    if (jsonBlob) {
      const res = await fetch(jsonBlob.url, { cache: "no-store" });
      if (res.ok) return (await res.json()) as PendingVisite;
    }
  } catch {
    // Blob not configured
  }

  const localPath = path.join(DATA_DIR, `${id}.json`);
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, "utf-8")) as PendingVisite;
  }
  return null;
}

/**
 * Finds the active (not yet published) pending visite for a given Sheet
 * row, so re-ingesting the same row (e.g. the BizDev unchecks/rechecks the
 * "Envoi" box) updates it in place instead of duplicating it. Once a visite
 * has been published, a fresh ingestion of the same row creates a new one
 * rather than silently mutating what's already live on the rapport.
 */
export async function findPendingVisiteByRowRef(
  sheetRowRef: string
): Promise<PendingVisite | null> {
  const all = await getAllPendingVisites();
  return all.find((v) => v.sheetRowRef === sheetRowRef && v.status !== "published") || null;
}

export async function savePendingVisite(visite: PendingVisite): Promise<void> {
  const json = JSON.stringify(visite, null, 2);
  try {
    await put(blobPath(visite.id), json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, `${visite.id}.json`), json);
  }
}

export async function deletePendingVisite(id: string): Promise<void> {
  try {
    const { blobs } = await list({ prefix: blobPath(id) });
    for (const blob of blobs) await del(blob.url);
  } catch {
    // Blob not configured
  }
  const localPath = path.join(DATA_DIR, `${id}.json`);
  if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
}
