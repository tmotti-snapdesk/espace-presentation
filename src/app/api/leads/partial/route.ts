import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const HUBSPOT_PORTAL_ID = "5180714";
const HUBSPOT_FORM_GUID_DEFAULT = "f07c5055-a3de-47d1-a1ae-5aced914d0ec";

interface IncomingField {
  name: string;
  value: string;
}

// Partial lead capture — called by the LP form each time it reveals a new
// chunk of fields. Lets us salvage information from visitors who abandon
// before submitting:
//   - always overwrites a stable Blob file keyed by `sessionId`
//   - if an email is already in hand, mirrors the data to HubSpot so the
//     contact gets progressively enriched (HubSpot dedupes by email)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
    }

    const incomingFields: IncomingField[] = Array.isArray(body.fields)
      ? body.fields
          .filter((f: unknown): f is IncomingField =>
            !!f && typeof f === "object" &&
            typeof (f as IncomingField).name === "string" &&
            (f as IncomingField).name.length > 0 &&
            typeof (f as IncomingField).value === "string"
          )
          .map((f: IncomingField) => ({ name: f.name, value: f.value }))
      : [];

    const searchingForOffice = Boolean(body.searchingForOffice);
    const fieldsRecord: Record<string, string> = Object.fromEntries(
      incomingFields.map((f) => [f.name, f.value])
    );
    const partial = {
      sessionId,
      ...fieldsRecord,
      searchingForOffice,
      stage: typeof body.stage === "number" ? body.stage : 0,
      espaceName: body.espaceName || "",
      espaceSlug: body.espaceSlug || "",
      hubspotFormId: body.hubspotFormId || "",
      source: body.source || "",
      utm: body.utm || "",
      updatedAt: new Date().toISOString(),
    };

    // Stable filename so each chunk advance overwrites the previous snapshot.
    await put(
      `leads-partial/${sessionId}.json`,
      JSON.stringify(partial, null, 2),
      {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      }
    );

    // Mirror to HubSpot only once an email is on hand — without it the
    // submissions endpoint cannot create or match a contact anyway.
    const emailField = incomingFields.find((f) => f.name === "email");
    if (emailField?.value) {
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
                { name: "declare_etre_en_recherche", value: searchingForOffice ? "true" : "false" },
              ],
              context: {
                pageUri: partial.source,
                pageName: `Snapdesk — ${partial.espaceName} (partiel)`,
              },
            }),
          }
        );
        if (!hubspotRes.ok) {
          const err = await hubspotRes.json();
          console.error("HubSpot partial submit error:", JSON.stringify(err));
        }
      } catch (hubspotErr) {
        console.error("HubSpot partial submit failed:", hubspotErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save partial lead";
    console.error("Partial lead save error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
