import { NextRequest, NextResponse } from "next/server";
import {
  resolveRapport,
  resolveAllRapports,
  saveRapport,
  normalizeRapportGeneral,
  normalizeRapportMonth,
} from "@/lib/rapports";
import { RapportData } from "@/types/rapport";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const espaceSlug = request.nextUrl.searchParams.get("espaceSlug");

    if (espaceSlug) {
      const rapport = await resolveRapport(espaceSlug);
      return NextResponse.json({ rapports: rapport ? [rapport] : [] });
    }

    const rapports = await resolveAllRapports();
    return NextResponse.json({ rapports });
  } catch (error) {
    console.error("List rapports error:", error);
    return NextResponse.json({ rapports: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { espaceSlug, month } = body;

    if (!espaceSlug || !month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "espaceSlug et month (YYYY-MM) sont requis" },
        { status: 400 }
      );
    }

    const existing = await resolveRapport(espaceSlug);
    if (existing) {
      return NextResponse.json(
        { error: "Un rapport existe déjà pour cet espace. Modifiez-le directement." },
        { status: 409 }
      );
    }

    const rapport: RapportData = {
      ...normalizeRapportGeneral(body, espaceSlug, null),
      months: [normalizeRapportMonth(body)],
    };

    await saveRapport(rapport);

    return NextResponse.json({
      success: true,
      espaceSlug,
      month,
      url: `/espaces/${espaceSlug}/rapports/${month}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create failed";
    console.error("Create rapport error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
