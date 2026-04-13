import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

const HUBSPOT_PORTAL_ID = "5180714";
const HUBSPOT_FORM_GUID_DEFAULT = "f07c5055-a3de-47d1-a1ae-5aced914d0ec";

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
      firstname: body.firstname || "",
      lastname: body.lastname || "",
      address: body.address || "",
      headcount: body.headcount || "",
      project: body.project || "",
      searchingForOffice: body.searchingForOffice || false,
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

    // 2. Submit to HubSpot Form
    // LP campaigns can pass their own form GUID via body.hubspotFormId
    const formGuid = body.hubspotFormId || HUBSPOT_FORM_GUID_DEFAULT;
    try {
      const hubspotRes = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${formGuid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: [
              { name: "email", value: lead.email },
              { name: "company", value: lead.company },
              ...(lead.firstname ? [{ name: "firstname", value: lead.firstname }] : []),
              ...(lead.lastname ? [{ name: "lastname", value: lead.lastname }] : []),
              ...(lead.address ? [{ name: "address", value: lead.address }] : []),
              ...(lead.headcount ? [{ name: "nombre_de_postes", value: lead.headcount }] : []),
              ...(lead.project ? [{ name: "projet_de_bureau", value: lead.project }] : []),
              { name: "declare_etre_en_recherche", value: lead.searchingForOffice ? "true" : "false" },
            ],
            context: {
              pageUri: lead.source,
              pageName: `Snapdesk — ${lead.espaceName}`,
            },
          }),
        }
      );

      if (!hubspotRes.ok) {
        const err = await hubspotRes.json();
        console.error("HubSpot form submit error:", JSON.stringify(err));
      }
    } catch (hubspotErr) {
      console.error("HubSpot submit failed:", hubspotErr);
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
