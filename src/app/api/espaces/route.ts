import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { getAllEspaces } from "@/lib/espaces";
import { EspaceData } from "@/types/espace";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const espaces: EspaceData[] = [];

    // 1. Load from local filesystem (demo data)
    const localEspaces = getAllEspaces();
    espaces.push(...localEspaces);

    // 2. Load from Vercel Blob
    try {
      const { blobs } = await list({ prefix: "espaces/" });
      const jsonBlobs = blobs.filter((b) => b.pathname.endsWith(".json"));

      for (const blob of jsonBlobs) {
        const res = await fetch(blob.url);
        if (res.ok) {
          const data = (await res.json()) as EspaceData;
          // Avoid duplicates (local takes precedence)
          if (!espaces.find((e) => e.slug === data.slug)) {
            espaces.push(data);
          }
        }
      }
    } catch {
      // Blob not configured — skip
    }

    // Sort by creation date (newest first)
    espaces.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ espaces });
  } catch (error) {
    console.error("List espaces error:", error);
    return NextResponse.json({ espaces: [] });
  }
}
