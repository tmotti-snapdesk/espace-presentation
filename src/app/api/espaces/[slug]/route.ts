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
      leadGenMode: body.leadGenMode || "unlock",
      leadGenDismissible: body.leadGenDismissible || false,
      presentationLink: body.presentationLink || "",
      template: body.template || "standard",
      storyTitle: body.storyTitle || "",
      storyText: body.storyText || "",
      storyPhotos: body.storyPhotos || [],
      highlightTitle: body.highlightTitle || "",
      highlightText: body.highlightText || "",
      highlightPhotos: body.highlightPhotos || [],
      buildingSurface: body.buildingSurface || "",
      buildingFloors: body.buildingFloors || "",
      buildingYear: body.buildingYear || "",
      buildingCertification: body.buildingCertification || "",
      neighborhoodTitle: body.neighborhoodTitle || "",
      neighborhoodText: body.neighborhoodText || "",
      neighborhoodPhotos: body.neighborhoodPhotos || [],
      testimonial: {
        quote: body.testimonialQuote || "",
        author: body.testimonialAuthor || "",
        role: body.testimonialRole || "",
      },
      createdAt: body.createdAt || new Date().toISOString(),
    };

    // With allowOverwrite + addRandomSuffix: false, put() overwrites
    // in place — no need to list+del first (saves 2 Blob ops per save).
    await put(`espaces/${slug}.json`, JSON.stringify(espaceData, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
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

// DUPLICATE an espace
export async function POST(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // 1. Resolve the source espace via the cached loader (handles both
    //    Blob and the local-filesystem fallback).
    const sourceData = await loadEspace(params.slug);

    if (!sourceData) {
      return NextResponse.json({ error: "Espace source non trouvé" }, { status: 404 });
    }

    // 2. Find next available slug suffix (-2, -3, ...) with a single
    //    list() instead of one per attempted suffix.
    const baseSlug = sourceData.slug.replace(/-\d+$/, "");
    const existingSlugs = new Set<string>();
    try {
      const { blobs } = await list({ prefix: `espaces/${baseSlug}` });
      for (const b of blobs) {
        const match = b.pathname.match(/^espaces\/(.+)\.json$/);
        if (match) existingSlugs.add(match[1]);
      }
    } catch {
      // Blob not configured — assume no collisions
    }

    let suffix = 2;
    let newSlug = `${baseSlug}-${suffix}`;
    while (existingSlugs.has(newSlug)) {
      suffix++;
      newSlug = `${baseSlug}-${suffix}`;
    }

    // 3. Create the duplicate
    const duplicateData: EspaceData = {
      ...sourceData,
      slug: newSlug,
      name: sourceData.name,
      createdAt: new Date().toISOString(),
    };

    await put(`espaces/${newSlug}.json`, JSON.stringify(duplicateData, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    invalidate(newSlug);

    return NextResponse.json({
      success: true,
      slug: newSlug,
      url: `/espaces/${newSlug}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Duplicate failed";
    console.error("Duplicate espace error:", message);
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
