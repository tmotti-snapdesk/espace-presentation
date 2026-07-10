import { NextRequest, NextResponse } from "next/server";
import { resolveAllEspaces, matchEspaceByName } from "@/lib/espaces";
import { reformulateVisite } from "@/lib/gemini";
import {
  findPendingVisiteByRowRef,
  savePendingVisite,
} from "@/lib/visitesPending";
import { toReportMonth } from "@/lib/frenchDate";
import { PendingVisite, PendingVisiteRaw } from "@/types/visitePending";

export const dynamic = "force-dynamic";

function uid(): string {
  return `pv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Webhook called by the Apps Script installed on the BizDev's "comptes
 * rendus de visite" Google Sheet whenever the "Envoi CR Visite ?" checkbox
 * is ticked on a row. See docs/apps-script-visites.md for the script and
 * setup instructions.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.SHEETS_WEBHOOK_SECRET;
  const authHeader = request.headers.get("authorization") || "";
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const raw: PendingVisiteRaw = {
      date: String(body["Date"] || ""),
      mois: String(body["Mois"] || ""),
      annee: String(body["Année"] || body["Annee"] || ""),
      espace: String(body["Espaces"] || ""),
      arrondissement: String(body["Arrondissement"] || ""),
      client: String(body["Client"] || ""),
      sales: String(body["Sales"] || ""),
      broker: String(body["Broker"] || ""),
      nombreVisite: String(body["Nombre de visite"] || ""),
      loi: String(body["LOI"] || ""),
      feedbacks: String(body["Feedbacks"] || ""),
    };
    const sheetRowRef = String(body.rowRef ?? "");
    if (!sheetRowRef) {
      return NextResponse.json({ error: "rowRef manquant" }, { status: 400 });
    }

    const existing = await findPendingVisiteByRowRef(sheetRowRef);

    const espaces = await resolveAllEspaces();
    const matched = matchEspaceByName(raw.espace, espaces);
    const month = toReportMonth(raw.mois, raw.annee, raw.date);

    let feedback = raw.feedbacks;
    let outcome = "";
    let geminiError: string | null = null;
    try {
      const result = await reformulateVisite({
        espaceName: matched?.name,
        client: raw.client,
        arrondissement: raw.arrondissement,
        sales: raw.sales,
        broker: raw.broker,
        loi: raw.loi,
        nombreVisite: raw.nombreVisite,
        feedbacksRaw: raw.feedbacks,
      });
      feedback = result.feedback;
      outcome = result.outcome;
    } catch (err) {
      // Gemini a échoué : on garde les notes brutes telles quelles plutôt que
      // de perdre la visite. Un admin pourra les reformuler manuellement ou
      // relancer Gemini depuis la file d'attente.
      geminiError = err instanceof Error ? err.message : "Erreur Gemini";
    }

    const now = new Date().toISOString();
    const visite: PendingVisite = {
      id: existing?.id || uid(),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      sheetRowRef,
      raw,
      suggestedEspaceSlug: matched?.slug || null,
      espaceSlug: existing?.espaceSlug ?? matched?.slug ?? null,
      month: existing?.month || month,
      prospect: raw.client,
      feedback,
      outcome,
      geminiError,
      status: "pending",
    };

    await savePendingVisite(visite);

    return NextResponse.json({
      success: true,
      id: visite.id,
      matchedEspace: matched?.slug || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingestion failed";
    console.error("Ingest visite error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
