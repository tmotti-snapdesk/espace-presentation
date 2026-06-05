import { NextRequest, NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { getAllRapports, rapportBlobPath } from "@/lib/rapports";
import { RapportData, emptyDistribution } from "@/types/rapport";

export const dynamic = "force-dynamic";

function normalizeRapport(body: Record<string, unknown>, slug: string, month: string): RapportData {
  const kpisBody = body as Record<string, unknown>;
  const distributionBody =
    (body.distribution as Partial<RapportData["distribution"]>) || {};
  const now = new Date().toISOString();

  return {
    espaceSlug: slug,
    espaceName: (body.espaceName as string) || "",
    espaceAddress: (body.espaceAddress as string) || "",
    marketingStartDate: (body.marketingStartDate as string) || "",
    month,
    ownerName: (body.ownerName as string) || "",
    intro: (body.intro as string) || "",
    monthlyBudget: (body.monthlyBudget as string) || "",
    targetedEmailingCount: parseInt(String(kpisBody.targetedEmailingCount ?? "0")) || 0,
    matchingFormsCount: parseInt(String(kpisBody.matchingFormsCount ?? "0")) || 0,
    preselectionCount: parseInt(String(kpisBody.preselectionCount ?? "0")) || 0,
    brokersListingActive: Boolean(body.brokersListingActive),
    brokersListingCount: parseInt(String(body.brokersListingCount ?? "450")) || 450,
    distribution: { ...emptyDistribution(), ...distributionBody },
    otherMarketingActions: Array.isArray(body.otherMarketingActions)
      ? (body.otherMarketingActions as string[]).filter(Boolean)
      : [],
    prospectionActions: Array.isArray(body.prospectionActions)
      ? (body.prospectionActions as string[]).filter(Boolean)
      : [],
    upcomingActions: Array.isArray(body.upcomingActions)
      ? (body.upcomingActions as string[]).filter(Boolean)
      : [],
    presentationUrl: (body.presentationUrl as string) || "",
    anonymizeVisitProspects: Boolean(body.anonymizeVisitProspects),
    visites: Array.isArray(body.visites) ? (body.visites as RapportData["visites"]) : [],
    recommendations: Array.isArray(body.recommendations)
      ? (body.recommendations as string[]).filter(Boolean)
      : [],
    similarEspaces: Array.isArray(body.similarEspaces)
      ? (body.similarEspaces as RapportData["similarEspaces"])
      : [],
    hiddenSections: Array.isArray(body.hiddenSections)
      ? (body.hiddenSections as string[]).filter((s): s is string => typeof s === "string")
      : [],
    createdAt: (body.createdAt as string) || now,
    updatedAt: now,
  };
}

export async function GET(request: NextRequest) {
  try {
    const espaceSlug = request.nextUrl.searchParams.get("espaceSlug");
    const rapports: RapportData[] = [];
    const seenKeys = new Set<string>();

    try {
      const prefix = espaceSlug ? `rapports/${espaceSlug}-` : "rapports/";
      const { blobs } = await list({ prefix });
      const jsonBlobs = blobs.filter((b) => b.pathname.endsWith(".json"));

      for (const blob of jsonBlobs) {
        const res = await fetch(blob.url, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as RapportData;
          const key = `${data.espaceSlug}-${data.month}`;
          rapports.push(data);
          seenKeys.add(key);
        }
      }
    } catch {
      // Blob not configured
    }

    const localRapports = getAllRapports();
    for (const local of localRapports) {
      const key = `${local.espaceSlug}-${local.month}`;
      if (seenKeys.has(key)) continue;
      if (espaceSlug && local.espaceSlug !== espaceSlug) continue;
      rapports.push(local);
    }

    rapports.sort((a, b) => b.month.localeCompare(a.month));

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

    const rapportData = normalizeRapport(body, espaceSlug, month);

    await put(rapportBlobPath(espaceSlug, month), JSON.stringify(rapportData, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

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
