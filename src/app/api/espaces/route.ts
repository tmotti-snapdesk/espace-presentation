import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { resolveAllEspaces } from "@/lib/espaces";
import { EspaceData } from "@/types/espace";

export const dynamic = "force-dynamic";

// Cached dashboard listing. Tagged so admin write routes can invalidate
// it instantly via revalidateTag('espaces-list'). The 5-minute TTL is a
// safety net in case a tag invalidation is missed. Delegates the actual
// read to lib/espaces.ts, the same function every other espace-reading
// page uses, so the dashboard never drifts out of sync with them.
const loadEspaces = unstable_cache(
  async (): Promise<EspaceData[]> => {
    const espaces = await resolveAllEspaces();
    return espaces.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  ["espaces-list"],
  { tags: ["espaces-list"], revalidate: 300 }
);

export async function GET() {
  try {
    const espaces = await loadEspaces();
    return NextResponse.json({ espaces });
  } catch (error) {
    console.error("List espaces error:", error);
    return NextResponse.json({ espaces: [] });
  }
}
