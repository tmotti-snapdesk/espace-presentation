import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Admin-only diagnostic for the HubSpot form auto-sync. Hits both the v3
// and the legacy v2 endpoints so we can see exactly what HubSpot returns
// for a given form GUID — useful when the LP keeps falling back to the
// 7-field default form despite a GUID being set.

const SESSION_TOKEN = "snapdesk_auth_2026";

export async function GET(request: NextRequest) {
  const session = cookies().get("snapdesk_session");
  if (session?.value !== SESSION_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formId = request.nextUrl.searchParams.get("id");
  if (!formId) {
    return NextResponse.json({ error: "Missing ?id=<formGuid>" }, { status: 400 });
  }

  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    return NextResponse.json({
      tokenPresent: false,
      message: "HUBSPOT_PRIVATE_APP_TOKEN missing in env. Add it in Vercel and redeploy.",
    });
  }

  const headers = { Authorization: `Bearer ${token}` };
  const probe = async (url: string) => {
    try {
      const res = await fetch(url, { headers, cache: "no-store" });
      const bodyText = await res.text();
      let body: unknown = bodyText;
      try { body = JSON.parse(bodyText); } catch {}
      return { url, status: res.status, ok: res.ok, body };
    } catch (err) {
      return { url, error: err instanceof Error ? err.message : String(err) };
    }
  };

  const [v3, v2] = await Promise.all([
    probe(`https://api.hubapi.com/marketing/v3/forms/${encodeURIComponent(formId)}`),
    probe(`https://api.hubapi.com/forms/v2/forms/${encodeURIComponent(formId)}`),
  ]);

  return NextResponse.json({
    tokenPresent: true,
    tokenPreview: `${token.slice(0, 8)}…${token.slice(-4)}`,
    formId,
    v3,
    v2,
  });
}
