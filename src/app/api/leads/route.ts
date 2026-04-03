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

    // 1. Save to Vercel Blob (backup)
    const filename = `leads/${lead.espaceSlug}-${Date.now()}.json`;
    await put(filename, JSON.stringify(lead, null, 2), {
      access: "public",
      contentType: "application/json",
    });

    // 2. Push to HubSpot
    if (process.env.HUBSPOT_ACCESS_TOKEN) {
      try {
        const hubspotRes = await fetch(
          "https://api.hubapi.com/crm/v3/objects/contacts",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              properties: {
                email: lead.email,
                company: lead.company,
                num_employees: lead.headcount || undefined,
                hs_lead_status: "NEW",
                lifecyclestage: "lead",
                leadsource: "Snapdesk Mini-Site",
                notes_last_updated: `Espace: ${lead.espaceName} | Source: ${lead.source} | UTM: ${lead.utm}`,
              },
            }),
          }
        );

        if (!hubspotRes.ok) {
          const hubspotError = await hubspotRes.json();
          console.error("HubSpot error:", JSON.stringify(hubspotError));

          // If contact already exists, try to update
          if (hubspotRes.status === 409 && hubspotError.message?.includes("already exists")) {
            const existingId = hubspotError.message.match(/ID: (\d+)/)?.[1];
            if (existingId) {
              await fetch(
                `https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
                  },
                  body: JSON.stringify({
                    properties: {
                      company: lead.company,
                      notes_last_updated: `Espace: ${lead.espaceName} | Source: ${lead.source} | UTM: ${lead.utm}`,
                    },
                  }),
                }
              );
            }
          }
        }
      } catch (hubspotErr) {
        console.error("HubSpot push failed:", hubspotErr);
        // Don't fail the request — lead is saved in Blob
      }
    }

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
