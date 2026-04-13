import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { list, put, del } from "@vercel/blob";
import { getEspaceBySlug } from "@/lib/espaces";
import { EspaceData } from "@/types/espace";

export const dynamic = "force-dynamic";

// Per-slug cache. Used by the admin edit page when loading the form.
// Invalidated explicitly on PUT/DELETE via revalidateTag.
const loadEspace = unstable_cache(
  async (slug: string): Promise<EspaceData | null> => {
    // 1. Try Vercel Blob first (most up-to-date)
    try {
      const { blobs } = await list({ prefix: `espaces/${slug}` });
      const jsonBlob = blobs.find((b) => b.pathname.endsWith(".json"));
      if (jsonBlob) {
        const res = await fetch(jsonBlob.url);
        if (res.ok) {
          return (await res.json()) as EspaceData;
        }
      }
    } catch {
      // Blob not configured
    }

    // 2. Fallback to local filesystem
    return getEspaceBySlug(slug);
  },
  ["espace-by-slug"],
  { tags: ["espaces-list"], revalidate: 300 }
);

// GET a single espace
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const data = await loadEspace(params.slug);
    if (data) return NextResponse.json(data);
    return NextResponse.json({ error: "Espace non trouvé" }, { status: 404 });
  } catch (error) {
    console.error("Get espace error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Invalidate every cache layer that may have stored data for `slug`.
// Called after every successful write or delete so admins (and ISR-served
// public pages) see fresh data immediately.
function invalidate(slug: string) {
  revalidateTag("espaces-list");
  revalidatePath(`/espaces/${slug}`);
  revalidatePath("/admin");
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
      workstations: parseInt(body.workstations) || 0,
      openSpaces: parseInt(body.openSpaces) || 0,
      meetingRooms: parseInt(body.meetingRooms) || 0,
      hasLunchArea: body.hasLunchArea || false,
      hasEquippedKitchen: body.hasEquippedKitchen || false,
      hasBalconFilant: body.hasBalconFilant || false,
      hasTerrace: body.hasTerrace || false,
      hasAirConditioning: body.hasAirConditioning || false,
      hasBikeRack: body.hasBikeRack || false,
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
      contacts: [
        { id: "manon", name: "Manon", role: "Chief Customer Officer", email: "", phone: "", photo: "" },
        { id: "roger", name: "Roger", role: "Responsable Maintenance Technique", email: "", phone: "", photo: "" },
      ],
      isLeadGen: body.isLeadGen || false,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    // Delete old blob if exists, then write new
    try {
      const { blobs } = await list({ prefix: `espaces/${slug}` });
      const jsonBlobs = blobs.filter((b) => b.pathname.endsWith(".json"));
      for (const blob of jsonBlobs) {
        await del(blob.url);
      }
    } catch {
      // OK if nothing to delete
    }

    await put(`espaces/${slug}.json`, JSON.stringify(espaceData, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    invalidate(slug);

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

    invalidate(params.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    console.error("Delete espace error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
