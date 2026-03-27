import { notFound } from "next/navigation";
import { getEspaceBySlug, getAllEspaces } from "@/lib/espaces";
import ShowcasePage from "./ShowcasePage";

export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  const espaces = getAllEspaces();
  return espaces.map((espace) => ({ slug: espace.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const espace = getEspaceBySlug(params.slug);
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

export default function EspacePage({
  params,
}: {
  params: { slug: string };
}) {
  const espace = getEspaceBySlug(params.slug);
  if (!espace) notFound();

  return <ShowcasePage espace={espace} />;
}
