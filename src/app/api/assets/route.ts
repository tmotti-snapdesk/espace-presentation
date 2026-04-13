import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";

export interface BlobAsset {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  kind: "image" | "video" | "other";
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|svg)$/i;
const VIDEO_EXT = /\.(mp4|mov|webm)$/i;

// Lists every blob in the store, tagged so upload completion invalidates
// it. A 5-minute TTL safety net bounds staleness if a tag invalidation
// is ever missed.
const loadAllAssets = unstable_cache(
  async (): Promise<BlobAsset[]> => {
    const out: BlobAsset[] = [];
    try {
      const { blobs } = await list();
      for (const b of blobs) {
        // Ignore internal data JSON files — they are not picker-worthy assets.
        if (b.pathname.endsWith(".json")) continue;

        let kind: BlobAsset["kind"] = "other";
        if (IMAGE_EXT.test(b.pathname)) kind = "image";
        else if (VIDEO_EXT.test(b.pathname)) kind = "video";

        out.push({
          url: b.url,
          pathname: b.pathname,
          size: b.size,
          uploadedAt: b.uploadedAt.toISOString(),
          kind,
        });
      }
    } catch {
      // Blob not configured
    }

    out.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
    return out;
  },
  ["assets-list"],
  { tags: ["assets-list"], revalidate: 300 }
);

export async function GET(req: NextRequest) {
  try {
    const kind = req.nextUrl.searchParams.get("kind");
    const all = await loadAllAssets();
    const filtered = kind ? all.filter((a) => a.kind === kind) : all;
    return NextResponse.json({ assets: filtered });
  } catch (error) {
    console.error("List assets error:", error);
    return NextResponse.json({ assets: [] });
  }
}
