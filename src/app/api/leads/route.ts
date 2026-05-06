import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

const HUBSPOT_PORTAL_ID = "5180714";
const HUBSPOT_FORM_GUID_DEFAULT = "f07c5055-a3de-47d1-a1ae-5aced914d0ec";

interface IncomingField {
  name: string;
  value: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Two payload shapes are accepted for back-compat:
    //  - new: { fields: [{ name, value }], searchingForOffice, ... }
    //  - legacy: { email, firstname, ..., project, searchingForOffice, ... }
    // We normalise to a single `fields` array forwarded to HubSpot.
    const incomingFields: IncomingField[] = Array.isArray(body.fields)
      ? body.fields
          .filter((f: unknown): f is IncomingField =>
            !!f && typeof f === "object" &&
            typeof (f as IncomingField).name === "string" &&
            (f as IncomingField).name.length > 0 &&
            typeof (f as IncomingField).value === "string"
          )
          .map((f: IncomingField) => ({ name: f.name, value: f.value }))
      : [
          ...(body.email     ? [{ name: "email",            value: String(body.email) }]            : []),
          ...(body.firstname ? [{ name: "firstname",        value: String(body.firstname) }]        : []),
          ...(body.lastname  ? [{ name: "lastname",         value: String(body.lastname) }]         : []),
          ...(body.company   ? [{ name: "company",          value: String(body.company) }]          : []),
          ...(body.address   ? [{ name: "address",          value: String(body.address) }]          : []),
          ...(body.headcount ? [{ name: "nombre_de_postes", value: String(body.headcount) }]        : []),
          ...(body.project   ? [{ name: "projet_de_bureau", value: String(body.project) }]          : []),
        ];

    const emailField = incomingFields.find((f) => f.name === "email");
    if (!emailField || !emailField.value) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Only honor the searching-for-office flag when the client explicitly
    // sent it — if the LP's HubSpot form doesn't have a
    // `declare_etre_en_recherche` property, forwarding it would 400 the
    // entire submission and silently drop the lead.
    const searchingForOffice =
      typeof body.searchingForOffice === "boolean" ? body.searchingForOffice : undefined;

    // Build a flat object for the Blob backup so historical leads stay
    // browsable even when their field set varies between LPs.
    const fieldsRecord: Record<string, string> = Object.fromEntries(
      incomingFields.map((f) => [f.name, f.value])
    );
    const lead = {
      ...fieldsRecord,
      searchingForOffice: searchingForOffice ?? false,
      espaceName: body.espaceName || "",
      espaceSlug: body.espaceSlug || "",
      source: body.source || "",
      utm: body.utm || "",
      createdAt: body.createdAt || new Date().toISOString(),
    };

    // 1. Save to Vercel Blob (backup)
    const filename = `leads/${lead.espaceSlug || "unknown"}-${Date.now()}.json`;
    await put(filename, JSON.stringify(lead, null, 2), {
      access: "public",
      contentType: "application/json",
    });

    // 2. Submit to HubSpot Form
    const formGuid = body.hubspotFormId || HUBSPOT_FORM_GUID_DEFAULT;
    try {
      const hubspotRes = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${formGuid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: [
              ...incomingFields,
              ...(searchingForOffice !== undefined
                ? [{ name: "declare_etre_en_recherche", value: searchingForOffice ? "true" : "false" }]
                : []),
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
