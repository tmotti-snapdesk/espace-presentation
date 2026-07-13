import { NextRequest, NextResponse } from "next/server";
import { getPendingVisite, savePendingVisite } from "@/lib/visitesPending";
import { resolveRapport, saveRapport } from "@/lib/rapports";
import { getEspaceBySlug } from "@/lib/espaces";
import { RapportData, RapportVisite, emptyRapportMonth, sortMonthsDesc } from "@/types/rapport";

export const dynamic = "force-dynamic";

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Creates a fresh, empty rapport shell for an espace that doesn't have one yet. */
function emptyRapport(espaceSlug: string): RapportData {
  const espace = getEspaceBySlug(espaceSlug);
  const espaceAddress = espace
    ? [espace.address, espace.postalCode, espace.city].filter(Boolean).join(", ")
    : "";
  const now = new Date().toISOString();
  return {
    espaceSlug,
    espaceName: espace?.name || "",
    espaceAddress,
    marketingStartDate: "",
    ownerName: "",
    intro: "",
    anonymizeVisitProspects: false,
    recommendations: [],
    similarEspaces: [],
    presentationUrl: "",
    hiddenSections: [],
    createdAt: now,
    updatedAt: now,
    months: [],
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await getPendingVisite(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Visite non trouvée" }, { status: 404 });
    }

    // Le corps de la requête (envoyé par l'écran de validation) prime sur ce
    // qui est stocké : ça évite de dépendre d'une relecture juste après une
    // sauvegarde, qui peut retomber sur une version encore en cache côté Blob.
    const body = await request.json().catch(() => ({}));
    const pending = {
      ...existing,
      espaceSlug: body.espaceSlug !== undefined ? body.espaceSlug : existing.espaceSlug,
      month: body.month !== undefined ? body.month : existing.month,
      prospect: body.prospect !== undefined ? body.prospect : existing.prospect,
      feedback: body.feedback !== undefined ? body.feedback : existing.feedback,
      outcome: body.outcome !== undefined ? body.outcome : existing.outcome,
    };

    if (!pending.espaceSlug) {
      return NextResponse.json(
        { error: "Choisissez l'espace concerné avant de publier" },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}$/.test(pending.month)) {
      return NextResponse.json({ error: "Mois invalide" }, { status: 400 });
    }

    const rapport = (await resolveRapport(pending.espaceSlug)) || emptyRapport(pending.espaceSlug);

    const monthIdx = rapport.months.findIndex((m) => m.month === pending.month);
    const monthEntry = monthIdx >= 0 ? rapport.months[monthIdx] : emptyRapportMonth(pending.month);

    const visite: RapportVisite = {
      id: uid("vis"),
      date: pending.raw.date || "",
      prospect: pending.prospect,
      activity: "",
      workstations: "",
      feedback: pending.feedback,
      outcome: pending.outcome,
      status: "published",
      rawNotes: pending.raw.feedbacks,
    };

    const updatedMonth = { ...monthEntry, visites: [...monthEntry.visites, visite] };
    const months =
      monthIdx >= 0
        ? rapport.months.map((m, i) => (i === monthIdx ? updatedMonth : m))
        : [...rapport.months, updatedMonth];

    const updatedRapport: RapportData = {
      ...rapport,
      months: sortMonthsDesc(months),
      updatedAt: new Date().toISOString(),
    };
    await saveRapport(updatedRapport);

    await savePendingVisite({
      ...pending,
      status: "published",
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      espaceSlug: pending.espaceSlug,
      month: pending.month,
      url: `/espaces/${pending.espaceSlug}/rapports/${pending.month}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed";
    console.error("Publish visite error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
