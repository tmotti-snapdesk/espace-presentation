import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

type Contact = {
  name?: string;
  email?: string;
  phone?: string;
  relationship?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.sender?.name || !Array.isArray(body?.contacts) || body.contacts.length === 0) {
      return NextResponse.json(
        { error: "Nom de l'expéditeur et au moins un contact requis" },
        { status: 400 }
      );
    }

    const cleanContacts: Contact[] = body.contacts
      .filter((c: Contact) => c?.name && c.name.trim())
      .map((c: Contact) => ({
        name: (c.name || "").trim(),
        email: (c.email || "").trim(),
        phone: (c.phone || "").trim(),
        relationship: (c.relationship || "").trim(),
      }));

    if (cleanContacts.length === 0) {
      return NextResponse.json(
        { error: "Au moins un contact avec un nom est requis" },
        { status: 400 }
      );
    }

    const reco = {
      sender: {
        name: String(body.sender.name).trim(),
        email: String(body.sender.email || "").trim(),
        phone: String(body.sender.phone || "").trim(),
      },
      contacts: cleanContacts,
      needs: Array.isArray(body.needs) ? body.needs : [],
      note: String(body.note || "").trim(),
      googleReviewOpened: Boolean(body.googleReviewOpened),
      source: String(body.source || "unknown"),
      submittedAt: body.submittedAt || new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    };

    const filename = `recommendations/${reco.source}-${Date.now()}.json`;
    await put(filename, JSON.stringify(reco, null, 2), {
      access: "public",
      contentType: "application/json",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save recommendation";
    console.error("Recommendation save error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "recommendations/" });

    const recos = await Promise.all(
      blobs.map(async (blob) => {
        const res = await fetch(blob.url);
        if (res.ok) return res.json();
        return null;
      })
    );

    return NextResponse.json({
      recommendations: recos.filter(Boolean),
      count: recos.filter(Boolean).length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list recommendations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
