import { NextRequest, NextResponse } from "next/server";
import { list, put, del } from "@vercel/blob";
import { getEspaceBySlug } from "@/lib/espaces";
import { EspaceData } from "@/types/espace";

export const dynamic = "force-dynamic";

// GET a single espace
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // 1. Try Vercel Blob first (most up-to-date)
    try {
      const { blobs } = await list({ prefix: `espaces/${params.slug}.json` });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      }
    } catch {
      // Blob not configured
    }

    // 2. Fallback to local filesystem
    const localData = getEspaceBySlug(params.slug);
    if (localData) return NextResponse.json(localData);

    return NextResponse.json({ error: "Espace non trouvé" }, { status: 404 });
  } catch (error) {
    console.error("Get espace error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// UPDATE an espace
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const slug = params.slug;

    const espaceData: EspaceData = {
      slug,
      name: body.name,
      tagline: body.tagline || "",
      address: body.address,
      city: body.city,
      postalCode: body.postalCode,
      latitude: parseFloat(body.latitude) || 48.8566,
      longitude: parseFloat(body.longitude) || 2.3522,
      workstations: parseInt(body.workstations) || 0,
      openSpaces: parseInt(body.openSpaces) || 0,
      meetingRooms: parseInt(body.meetingRooms) || 0,
      hasLunchArea: body.hasLunchArea || false,
      hasEquippedKitchen: body.hasEquippedKitchen || false,
      amenities: typeof body.amenities === "string"
        ? body.amenities.split(",").map((a: string) => a.trim()).filter(Boolean)
        : body.amenities || [],
      metroStations: body.metroStations || [],
      availability: body.availability,
      pricePerMonth: body.pricePerMonth,
      leaseDuration: body.leaseDuration,
      noticePeriod: body.noticePeriod,
      videoUrl: body.videoUrl || "",
      photos: body.photos || [],
      floorPlanImage: body.floorPlanImage || "",
      contacts: body.contacts || [],
      createdAt: body.createdAt || new Date().toISOString(),
    };

    // Delete old blob if exists, then write new
    try {
      const { blobs } = await list({ prefix: `espaces/${slug}.json` });
      for (const blob of blobs) {
        await del(blob.url);
      }
    } catch {
      // OK if nothing to delete
    }

    await put(`espaces/${slug}.json`, JSON.stringify(espaceData, null, 2), {
      access: "public",
      contentType: "application/json",
    });

    return NextResponse.json({
      success: true,
      slug,
      url: `/espaces/${slug}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    console.error("Update espace error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE an espace
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Delete JSON blob
    try {
      const { blobs } = await list({ prefix: `espaces/${params.slug}` });
      for (const blob of blobs) {
        await del(blob.url);
      }
    } catch {
      // Blob not configured
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    console.error("Delete espace error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
