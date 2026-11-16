import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { list } from "@vercel/blob";
import { LandingPageData } from "@/types/lp";

export const dynamic = "force-dynamic";

const loadAllLps = unstable_cache(
  async (): Promise<LandingPageData[]> => {
    const lps: LandingPageData[] = [];

    try {
      const { blobs } = await list({ prefix: "lp/" });
      const jsonBlobs = blobs.filter((b) => b.pathname.endsWith(".json"));

      for (const blob of jsonBlobs) {
        const res = await fetch(blob.url);
        if (res.ok) {
          lps.push((await res.json()) as LandingPageData);
        }
      }
    } catch {
      // Blob not configured
    }

    lps.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return lps;
  },
  ["lp-list"],
  { tags: ["lp-list"], revalidate: 300 }
);

export async function GET() {
  try {
    const lps = await loadAllLps();
    return NextResponse.json({ lps });
  } catch (error) {
    console.error("List LPs error:", error);
    return NextResponse.json({ lps: [] });
  }
}
