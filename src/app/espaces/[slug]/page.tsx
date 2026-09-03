import { cache } from "react";
import { notFound } from "next/navigation";
import { resolveEspaceBySlug } from "@/lib/espaces";
import ShowcasePage from "./ShowcasePage";

// Nominally caches the rendered HTML for up to an hour, but
// resolveEspaceBySlug() reads the espace JSON with cache: "no-store" (see
// src/lib/espaces.ts), which opts every request into a fresh render anyway
// — otherwise an edit could stay invisible for up to this window. Kept at
// 3600 rather than removed so a future switch back to a cached fetch (e.g.
// once revalidateTag covers this read) regains the traffic-cost benefit
// without a second change here.
export const revalidate = 3600;

// Dedupe Blob calls between generateMetadata() and the page component
// during the same render pass, and delegate the actual read to
// lib/espaces.ts so this page, the admin API, and the broker-facing pages
// (fiche, rapports, directory) all resolve an espace's photos through the
// exact same Blob/local-fallback logic — one fix there covers every page.
const resolveEspace = cache((slug: string) => resolveEspaceBySlug(slug));

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
