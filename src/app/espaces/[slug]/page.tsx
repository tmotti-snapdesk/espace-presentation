import { cache } from "react";
import { notFound } from "next/navigation";
import { resolveEspaceBySlug } from "@/lib/espaces";
import ShowcasePage from "./ShowcasePage";

// Revalidate the rendered HTML at most once per hour. After this delay,
// the next request triggers a single re-render in the background. With
// this in place, paid traffic on a single page costs ~2 Blob ops per
// hour instead of 2 ops per visitor.
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
