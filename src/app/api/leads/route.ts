import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.company) {
      return NextResponse.json(
        { error: "Email et entreprise requis" },
        { status: 400 }
      );
    }

    const lead = {
      email: body.email,
      company: body.company,
      headcount: body.headcount || "",
      espaceName: body.espaceName || "",
      espaceSlug: body.espaceSlug || "",
      source: body.source || "",
      utm: body.utm || "",
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const filename = `leads/${lead.espaceSlug}-${Date.now()}.json`;

    await put(filename, JSON.stringify(lead, null, 2), {
      access: "public",
      contentType: "application/json",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save lead";
    console.error("Lead save error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET all leads (for admin/export)
export async function GET() {
  try {
    const { blobs } = await list({ prefix: "leads/" });

    const leads = await Promise.all(
      blobs.map(async (blob) => {
        const res = await fetch(blob.url);
        if (res.ok) return res.json();
        return null;
      })
    );

    return NextResponse.json({
      leads: leads.filter(Boolean),
      count: leads.filter(Boolean).length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list leads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
