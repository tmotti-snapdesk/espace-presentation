import { cache } from "react";
import { notFound } from "next/navigation";
import { getEspaceBySlug } from "@/lib/espaces";
import { EspaceData } from "@/types/espace";
import { list } from "@vercel/blob";
import ShowcasePage from "./ShowcasePage";

// Revalidate the rendered HTML at most once per hour. After this delay,
// the next request triggers a single re-render in the background. With
// this in place, paid traffic on a single page costs ~2 Blob ops per
// hour instead of 2 ops per visitor.
export const revalidate = 3600;

// Dedupe Blob calls between generateMetadata() and the page component
// during the same render pass. Without this wrapper, every request did
// 2× list() + 2× fetch() instead of 1× each.
const resolveEspace = cache(async (slug: string): Promise<EspaceData | null> => {
  // 1. Try Vercel Blob first (for dynamically created/edited espaces)
  try {
    const { blobs } = await list({ prefix: `espaces/${slug}` });
    const jsonBlob = blobs.find((b) => b.pathname.endsWith(".json"));
    if (jsonBlob) {
      // Let Next.js cache the response — ISR handles invalidation via
      // revalidatePath() called from the admin write routes.
      const res = await fetch(jsonBlob.url);
      if (res.ok) {
        return (await res.json()) as EspaceData;
      }
    }
  } catch {
    // Blob not configured or not found — fall through
  }

  // 2. Fallback to local filesystem (for demo/bundled data)
  const localData = getEspaceBySlug(slug);
  if (localData) return localData;

  return null;
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const espace = await resolveEspace(params.slug);
  if (!espace) return { title: "Espace non trouvé" };

  return {
    title: `${espace.name} | Snapdesk`,
    description: `Découvrez ${espace.name} - ${espace.workstations} postes à ${espace.city}`,
    openGraph: {
      title: `${espace.name} | Snapdesk`,
      description: `${espace.workstations} postes - ${espace.address}, ${espace.city}`,
    },
  };
}

export default async function EspacePage({
  params,
}: {
  params: { slug: string };
}) {
  const espace = await resolveEspace(params.slug);
  if (!espace) notFound();

  return <ShowcasePage espace={espace} />;
}
