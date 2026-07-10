import { notFound, redirect } from "next/navigation";
import { resolveRapport } from "@/lib/rapports";
import { sortMonthsDesc } from "@/types/rapport";

export const dynamic = "force-dynamic";

export default async function RapportRedirectPage({
  params,
}: {
  params: { slug: string };
}) {
  const rapport = await resolveRapport(params.slug);
  if (!rapport || rapport.months.length === 0) notFound();

  const latestMonth = sortMonthsDesc(rapport.months)[0].month;
  redirect(`/espaces/${params.slug}/rapports/${latestMonth}`);
}
