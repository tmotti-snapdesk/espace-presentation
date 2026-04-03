import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

async function hubspotRequest(path: string, method: string, body?: Record<string, unknown>) {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function findContactByEmail(email: string): Promise<string | null> {
  const res = await hubspotRequest("/crm/v3/objects/contacts/search", "POST", {
    filterGroups: [
      {
        filters: [
          { propertyName: "email", operator: "EQ", value: email },
        ],
      },
    ],
  });
  if (res.ok && res.data.total > 0) {
    return res.data.results[0].id;
  }
  return null;
}

async function createNote(contactId: string, noteBody: string) {
  await hubspotRequest("/crm/v3/objects/notes", "POST", {
    properties: {
      hs_note_body: noteBody,
      hs_timestamp: new Date().toISOString(),
    },
    associations: [
      {
        to: { id: contactId },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 202,
          },
        ],
      },
    ],
  });
}

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
        const noteText = [
          `<strong>Demande de présentation — ${lead.espaceName}</strong>`,
          `<br/>Entreprise : ${lead.company}`,
          lead.headcount ? `<br/>Postes recherchés : ${lead.headcount}` : "",
          `<br/>Page : ${lead.source}`,
          lead.utm ? `<br/>UTM : ${lead.utm}` : "",
          `<br/>Date : ${new Date(lead.createdAt).toLocaleString("fr-FR")}`,
        ].filter(Boolean).join("");

        // Check if contact already exists
        let contactId = await findContactByEmail(lead.email);

        if (contactId) {
          // Update existing contact
          await hubspotRequest(`/crm/v3/objects/contacts/${contactId}`, "PATCH", {
            properties: {
              company: lead.company,
              ...(lead.headcount ? { num_employees: lead.headcount } : {}),
            },
          });
        } else {
          // Create new contact
          const createRes = await hubspotRequest("/crm/v3/objects/contacts", "POST", {
            properties: {
              email: lead.email,
              company: lead.company,
              ...(lead.headcount ? { num_employees: lead.headcount } : {}),
              hs_lead_status: "NEW",
              lifecyclestage: "lead",
            },
          });

          if (createRes.ok) {
            contactId = createRes.data.id;
          } else {
            console.error("HubSpot create error:", JSON.stringify(createRes.data));
          }
        }

        // Create a note on the contact
        if (contactId) {
          await createNote(contactId, noteText);
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
