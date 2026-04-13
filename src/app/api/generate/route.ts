import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { put } from "@vercel/blob";
import { slugify } from "@/lib/espaces";
import { EspaceData } from "@/types/espace";

const DEFAULT_CONTACTS = [
  {
    id: "manon",
    name: "Manon",
    role: "Chief Customer Officer",
    email: "",
    phone: "",
    photo: "",
  },
  {
    id: "roger",
    name: "Roger",
    role: "Responsable Maintenance Technique",
    email: "",
    phone: "",
    photo: "",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = slugify(body.name);

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
      amenities: body.amenities
        ? body.amenities
            .split(",")
            .map((a: string) => a.trim())
            .filter(Boolean)
        : [],
      metroStations: body.metroStations || [],
      availability: body.availability,
      pricePerMonth: body.pricePerMonth,
      leaseDuration: body.leaseDuration,
      noticePeriod: body.noticePeriod,
      videoUrl: body.videoUrl || "",
      photos: body.photos || [],
      floorPlanImage: body.floorPlanImage || "",
      contacts: DEFAULT_CONTACTS,
      isLeadGen: body.isLeadGen || false,
      createdAt: new Date().toISOString(),
    };

    await put(`espaces/${slug}.json`, JSON.stringify(espaceData, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    // Invalidate caches so the dashboard and the new public page reflect
    // the freshly created espace immediately.
    revalidateTag("espaces-list");
    revalidatePath(`/espaces/${slug}`);
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      slug,
      url: `/espaces/${slug}`,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
