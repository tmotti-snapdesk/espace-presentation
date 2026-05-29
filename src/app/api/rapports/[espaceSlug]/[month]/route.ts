import { NextRequest, NextResponse } from "next/server";
import { list, put, del } from "@vercel/blob";
import { getRapportByKey, rapportBlobPath } from "@/lib/rapports";
import { RapportData, emptyDistribution } from "@/types/rapport";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { espaceSlug: string; month: string };
}

async function loadFromBlob(espaceSlug: string, month: string): Promise<RapportData | null> {
  try {
    const { blobs } = await list({
      prefix: rapportBlobPath(espaceSlug, month).replace(".json", ""),
    });
    const jsonBlob = blobs.find((b) => b.pathname.endsWith(".json"));
    if (!jsonBlob) return null;
    const res = await fetch(jsonBlob.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as RapportData;
  } catch {
    return null;
  }
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const blobData = await loadFromBlob(params.espaceSlug, params.month);
    if (blobData) return NextResponse.json(blobData);

    const localData = getRapportByKey(params.espaceSlug, params.month);
    if (localData) return NextResponse.json(localData);

    return NextResponse.json({ error: "Rapport non trouvé" }, { status: 404 });
  } catch (error) {
    console.error("Get rapport error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const body = await request.json();
    const { espaceSlug, month } = params;

    const existing =
      (await loadFromBlob(espaceSlug, month)) || getRapportByKey(espaceSlug, month);

    const now = new Date().toISOString();
    const distribution = {
      ...emptyDistribution(),
      ...(body.distribution || {}),
    };

    const rapportData: RapportData = {
      espaceSlug,
      espaceName: body.espaceName || existing?.espaceName || "",
      espaceAddress: body.espaceAddress ?? existing?.espaceAddress ?? "",
      marketingStartDate:
        body.marketingStartDate ?? existing?.marketingStartDate ?? "",
      month,
      ownerName: body.ownerName ?? existing?.ownerName ?? "",
      intro: body.intro ?? existing?.intro ?? "",
      monthlyBudget: body.monthlyBudget ?? existing?.monthlyBudget ?? "",
      totalBudget: body.totalBudget ?? existing?.totalBudget ?? "",
      matchingFormsCount: parseInt(String(body.matchingFormsCount ?? "0")) || 0,
      preselectionCount: parseInt(String(body.preselectionCount ?? "0")) || 0,
      brokersListingActive: Boolean(body.brokersListingActive),
      brokersListingCount: parseInt(String(body.brokersListingCount ?? "450")) || 450,
      distribution,
      otherMarketingActions: Array.isArray(body.otherMarketingActions)
        ? body.otherMarketingActions.filter(Boolean)
        : [],
      prospectionActions: Array.isArray(body.prospectionActions)
        ? body.prospectionActions.filter(Boolean)
        : [],
      upcomingActions: Array.isArray(body.upcomingActions)
        ? body.upcomingActions.filter(Boolean)
        : [],
      presentationUrl: body.presentationUrl ?? existing?.presentationUrl ?? "",
      visites: Array.isArray(body.visites) ? body.visites : [],
      recommendations: Array.isArray(body.recommendations)
        ? body.recommendations.filter(Boolean)
        : [],
      similarEspaces: Array.isArray(body.similarEspaces) ? body.similarEspaces : [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    try {
      const { blobs } = await list({
        prefix: rapportBlobPath(espaceSlug, month).replace(".json", ""),
      });
      const jsonBlobs = blobs.filter((b) => b.pathname.endsWith(".json"));
      for (const blob of jsonBlobs) {
        await del(blob.url);
      }
    } catch {
      // OK if nothing to delete
    }

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
    const message = error instanceof Error ? error.message : "Update failed";
    console.error("Update rapport error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    try {
      const { blobs } = await list({
        prefix: rapportBlobPath(params.espaceSlug, params.month).replace(".json", ""),
      });
      for (const blob of blobs) {
        await del(blob.url);
      }
    } catch {
      // Blob not configured
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    console.error("Delete rapport error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
