import { notFound } from "next/navigation";
import { resolveRapport } from "@/lib/rapports";
import { formatMonthLabel } from "@/types/rapport";
import RapportShowcase from "./RapportShowcase";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; month: string };
}) {
  const rapport = await resolveRapport(params.slug);
  if (!rapport) return { title: "Rapport non trouvé" };

  const monthLabel = formatMonthLabel(params.month);
  return {
    title: `Rapport ${monthLabel} - ${rapport.espaceName} | Snapdesk`,
    description: `Rapport de commercialisation du mois de ${monthLabel} pour ${rapport.espaceName}.`,
  };
}

export default async function RapportPage({
  params,
}: {
  params: { slug: string; month: string };
}) {
  if (!/^\d{4}-\d{2}$/.test(params.month)) notFound();
  const rapport = await resolveRapport(params.slug);
  if (!rapport || rapport.months.length === 0) notFound();

  return <RapportShowcase rapport={rapport} initialMonth={params.month} />;
}
