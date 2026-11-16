import { notFound } from "next/navigation";
import { resolveEspaceBySlug } from "@/lib/espaces";
import { resolveRapport } from "@/lib/rapports";
import FicheBrokerPage from "./FicheBrokerPage";

// Depends on the espace *and* the comm rapport (for the presentation link),
// so it's rendered on-demand rather than cached like the main showcase page.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const espace = await resolveEspaceBySlug(params.slug);
  if (!espace) return { title: "Fiche non trouvée" };

  return {
    title: `Fiche broker — ${espace.name} | Snapdesk`,
    description: `Fiche synthétique de ${espace.name} à destination des brokers : éléments clés, présentation et photos.`,
  };
}

export default async function FicheBrokerRoute({
  params,
}: {
  params: { slug: string };
}) {
  const [espace, rapport] = await Promise.all([
    resolveEspaceBySlug(params.slug),
    resolveRapport(params.slug),
  ]);

  if (!espace) notFound();

  // Same link as the one shown on the comm report ("Voir la présentation
  // commerciale"), falling back to the espace's own link when no rapport
  // has been created yet.
  const presentationUrl = rapport?.presentationUrl || espace.presentationLink || "";

  return <FicheBrokerPage espace={espace} presentationUrl={presentationUrl} />;
}
