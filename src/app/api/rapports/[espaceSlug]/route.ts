import { NextRequest, NextResponse } from "next/server";
import {
  resolveRapport,
  saveRapport,
  deleteRapport,
  normalizeRapportGeneral,
  normalizeRapportMonth,
} from "@/lib/rapports";
import { RapportData, RapportMonthData, sortMonthsDesc } from "@/types/rapport";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { espaceSlug: string };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const rapport = await resolveRapport(params.espaceSlug);
    if (!rapport) {
      return NextResponse.json({ error: "Rapport non trouvé" }, { status: 404 });
    }
    return NextResponse.json(rapport);
  } catch (error) {
    console.error("Get rapport error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const body = await request.json();
    const espaceSlug = params.espaceSlug;
    const existing = await resolveRapport(espaceSlug);

    const general = normalizeRapportGeneral(body, espaceSlug, existing);

    let months: RapportMonthData[] = existing?.months || [];
    if (Array.isArray(body.months)) {
      // The admin form manages every month tab at once and sends the full array.
      months = (body.months as Record<string, unknown>[]).map((m) => normalizeRapportMonth(m));
    } else if (body.month) {
      // Single-month upsert, used by the visite ingestion/publish flow.
      const monthData = normalizeRapportMonth(body);
      const idx = months.findIndex((m) => m.month === monthData.month);
      months =
        idx >= 0
          ? months.map((m, i) => (i === idx ? monthData : m))
          : [...months, monthData];
    }

    const rapport: RapportData = { ...general, months: sortMonthsDesc(months) };
    await saveRapport(rapport);

    return NextResponse.json({
      success: true,
      espaceSlug,
      url: `/espaces/${espaceSlug}/rapports`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    console.error("Update rapport error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const month = request.nextUrl.searchParams.get("month");

    if (month) {
      const existing = await resolveRapport(params.espaceSlug);
      if (existing) {
        await saveRapport({
          ...existing,
          months: existing.months.filter((m) => m.month !== month),
          updatedAt: new Date().toISOString(),
        });
      }
      return NextResponse.json({ success: true });
    }

    await deleteRapport(params.espaceSlug);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    console.error("Delete rapport error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
