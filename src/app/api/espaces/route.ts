import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { getAllEspaces } from "@/lib/espaces";
import { EspaceData } from "@/types/espace";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const espaces: EspaceData[] = [];
    const seenSlugs = new Set<string>();

    // 1. Load from Vercel Blob first (most up-to-date)
    try {
      const { blobs } = await list({ prefix: "espaces/" });
      const jsonBlobs = blobs.filter((b) => b.pathname.endsWith(".json"));

      for (const blob of jsonBlobs) {
        const res = await fetch(blob.url, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as EspaceData;
          espaces.push(data);
          seenSlugs.add(data.slug);
        }
      }
    } catch {
      // Blob not configured — skip
    }

    // 2. Fallback: local filesystem (demo data not yet in Blob)
    const localEspaces = getAllEspaces();
    for (const local of localEspaces) {
      if (!seenSlugs.has(local.slug)) {
        espaces.push(local);
      }
    }

    // Sort by creation date (newest first)
    espaces.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ espaces });
  } catch (error) {
    console.error("List espaces error:", error);
    return NextResponse.json({ espaces: [] });
  }
}
