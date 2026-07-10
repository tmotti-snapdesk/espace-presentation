import { NextRequest, NextResponse } from "next/server";
import { getPendingVisite, savePendingVisite } from "@/lib/visitesPending";
import { reformulateVisite } from "@/lib/gemini";
import { getEspaceBySlug } from "@/lib/espaces";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const existing = await getPendingVisite(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Visite non trouvée" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const espace = existing.espaceSlug ? getEspaceBySlug(existing.espaceSlug) : null;

    const result = await reformulateVisite({
      espaceName: espace?.name,
      client: existing.raw.client,
      arrondissement: existing.raw.arrondissement,
      sales: existing.raw.sales,
      broker: existing.raw.broker,
      loi: existing.raw.loi,
      nombreVisite: existing.raw.nombreVisite,
      feedbacksRaw: existing.raw.feedbacks,
      extraInstruction: body.instruction,
    });

    const updated = {
      ...existing,
      feedback: result.feedback,
      outcome: result.outcome,
      geminiError: null,
      updatedAt: new Date().toISOString(),
    };

    await savePendingVisite(updated);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reformulation failed";
    console.error("Reformulate visite error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
