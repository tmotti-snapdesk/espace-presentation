import { notFound } from "next/navigation";
import { getEspaceBySlug, getAllEspaces } from "@/lib/espaces";
import { EspaceData } from "@/types/espace";
import { list } from "@vercel/blob";
import ShowcasePage from "./ShowcasePage";

export const dynamic = "force-dynamic";

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

async function resolveEspace(slug: string): Promise<EspaceData | null> {
  // 1. Try Vercel Blob first (for dynamically created/edited espaces)
  try {
    const { blobs } = await list({ prefix: `espaces/${slug}.json` });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" });
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
