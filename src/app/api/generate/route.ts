import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { slugify } from "@/lib/espaces";
import { EspaceData } from "@/types/espace";

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
      latitude: parseFloat(body.latitude) || 48.8566,
      longitude: parseFloat(body.longitude) || 2.3522,
      workstations: parseInt(body.workstations) || 0,
      openSpaces: parseInt(body.openSpaces) || 0,
      meetingRooms: parseInt(body.meetingRooms) || 0,
      hasLunchArea: body.hasLunchArea || false,
      hasEquippedKitchen: body.hasEquippedKitchen || false,
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
      contacts: body.contacts || [],
      createdAt: new Date().toISOString(),
    };

    // Store the JSON data in Vercel Blob
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
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
