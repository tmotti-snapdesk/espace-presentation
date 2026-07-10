import { NextRequest, NextResponse } from "next/server";
import { getPendingVisite, savePendingVisite } from "@/lib/visitesPending";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const visite = await getPendingVisite(params.id);
  if (!visite) return NextResponse.json({ error: "Visite non trouvée" }, { status: 404 });
  return NextResponse.json(visite);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const existing = await getPendingVisite(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Visite non trouvée" }, { status: 404 });
    }

    const body = await request.json();
    const updated = {
      ...existing,
      espaceSlug: body.espaceSlug !== undefined ? body.espaceSlug : existing.espaceSlug,
      month: body.month !== undefined ? body.month : existing.month,
      prospect: body.prospect !== undefined ? body.prospect : existing.prospect,
      feedback: body.feedback !== undefined ? body.feedback : existing.feedback,
      outcome: body.outcome !== undefined ? body.outcome : existing.outcome,
      status: body.status !== undefined ? body.status : existing.status,
      updatedAt: new Date().toISOString(),
    };

    await savePendingVisite(updated);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    console.error("Update pending visite error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
