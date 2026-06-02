import { notFound } from "next/navigation";
import { list } from "@vercel/blob";
import { getRapportByKey, normalizeRapportData, rapportBlobPath } from "@/lib/rapports";
import { RapportData, formatMonthLabel } from "@/types/rapport";
import RapportShowcase from "./RapportShowcase";

export const dynamic = "force-dynamic";

async function resolveRapport(espaceSlug: string, month: string): Promise<RapportData | null> {
  try {
    const { blobs } = await list({
      prefix: rapportBlobPath(espaceSlug, month).replace(".json", ""),
    });
    const jsonBlob = blobs.find((b) => b.pathname.endsWith(".json"));
    if (jsonBlob) {
      const res = await fetch(jsonBlob.url, { cache: "no-store" });
      if (res.ok) return normalizeRapportData(await res.json());
    }
  } catch {
    // Blob not configured
  }

  const localData = getRapportByKey(espaceSlug, month);
  if (localData) return localData;

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; month: string };
}) {
  const rapport = await resolveRapport(params.slug, params.month);
  if (!rapport) return { title: "Rapport non trouvé" };

  const monthLabel = formatMonthLabel(rapport.month);
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
  const rapport = await resolveRapport(params.slug, params.month);
  if (!rapport) notFound();

  return <RapportShowcase rapport={rapport} />;
}
