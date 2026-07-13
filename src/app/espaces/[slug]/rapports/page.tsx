import { notFound } from "next/navigation";
import { resolveRapport } from "@/lib/rapports";
import { sortMonthsDesc } from "@/types/rapport";
import RapportShowcase from "./[month]/RapportShowcase";

export const dynamic = "force-dynamic";

/**
 * URL canonique du rapport d'un espace : un seul lien à partager, quel que
 * soit le mois. Affiche par défaut le mois le plus récent, avec des onglets
 * pour l'historique. L'ancienne URL avec le mois dans le chemin
 * (/rapports/[month]) reste disponible pour ne pas casser les liens déjà
 * envoyés, mais ce n'est plus celle à partager pour un nouveau rapport.
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const rapport = await resolveRapport(params.slug);
  if (!rapport) return { title: "Rapport non trouvé" };

  return {
    title: `Rapport de commercialisation - ${rapport.espaceName} | Snapdesk`,
    description: `Rapport de commercialisation pour ${rapport.espaceName}.`,
  };
}

export default async function RapportPage({
  params,
}: {
  params: { slug: string };
}) {
  const rapport = await resolveRapport(params.slug);
  if (!rapport || rapport.months.length === 0) notFound();

  const latestMonth = sortMonthsDesc(rapport.months)[0].month;
  return <RapportShowcase rapport={rapport} initialMonth={latestMonth} />;
}
