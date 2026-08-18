import { NextResponse } from "next/server";
import { resolveAllEspaces } from "@/lib/espaces";
import { EspaceData } from "@/types/espace";

export const dynamic = "force-dynamic";

// Dashboard listing. Used to go through an unstable_cache tagged
// "espaces-list" with a 5-minute TTL, invalidated via revalidateTag on
// every admin write. In practice that tag invalidation isn't guaranteed to
// propagate instantly across regions/instances, so the dashboard could
// keep showing minutes-old data right after a save — reads straight
// through instead, the same path every other espace-reading page uses.
const loadEspaces = async (): Promise<EspaceData[]> => {
  const espaces = await resolveAllEspaces();
  return espaces.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export async function GET() {
  try {
    const espaces = await loadEspaces();
    return NextResponse.json({ espaces });
  } catch (error) {
    console.error("List espaces error:", error);
    return NextResponse.json({ espaces: [] });
  }
}
