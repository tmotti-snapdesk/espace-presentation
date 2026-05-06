import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { list, put, del } from "@vercel/blob";
import { LandingPageData } from "@/types/lp";

export const dynamic = "force-dynamic";

const loadLp = unstable_cache(
  async (slug: string): Promise<LandingPageData | null> => {
    try {
      const { blobs } = await list({ prefix: `lp/${slug}` });
      const jsonBlob = blobs.find((b) => b.pathname.endsWith(".json"));
      if (jsonBlob) {
        const res = await fetch(jsonBlob.url);
        if (res.ok) return (await res.json()) as LandingPageData;
      }
    } catch {
      // Blob not configured
    }
    return null;
  },
  ["lp-by-slug"],
  { tags: ["lp-list"], revalidate: 300 }
);

function invalidate(slug: string) {
  revalidateTag("lp-list");
  revalidatePath(`/lp/${slug}`);
  revalidatePath("/admin/lp");
}

// GET single LP
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const data = await loadLp(params.slug);
    if (data) return NextResponse.json(data);
    return NextResponse.json({ error: "Landing page non trouvée" }, { status: 404 });
  } catch (error) {
    console.error("Get LP error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// UPDATE LP
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const slug = params.slug;

    const lpData: LandingPageData = {
      slug,
      internalTitle: body.internalTitle || slug,
      heroVideoUrl: body.heroVideoUrl || "",
      heroImageUrl: body.heroImageUrl || undefined,
      heroTitle: body.heroTitle || "",
      heroSubtitle: body.heroSubtitle || "",
      heroCtaText: body.heroCtaText || "En savoir plus",
      // Optional sections — preserve whatever the client sends
      missionLabel: body.missionLabel,
      missionTitle: body.missionTitle,
      missionSubtitle: body.missionSubtitle,
      missionCards: body.missionCards,
      missionPhotos: body.missionPhotos,
      processLabel: body.processLabel,
      processTitle: body.processTitle,
      processSubtitle: body.processSubtitle,
      processSteps: body.processSteps,
      urgencyLabel: body.urgencyLabel,
      urgencyTitle: body.urgencyTitle,
      urgencySubtitle: body.urgencySubtitle,
      urgencySteps: body.urgencySteps,
      urgencyDeadline: body.urgencyDeadline,
      urgencyExpiredText: body.urgencyExpiredText,
      socialProofTitle: body.socialProofTitle,
      socialProofLogos: body.socialProofLogos,
      socialProofShowGoogleRating: body.socialProofShowGoogleRating,
      testimonials: body.testimonials,
      testimonialQuote: body.testimonialQuote,
      testimonialAuthorName: body.testimonialAuthorName,
      testimonialAuthorCompany: body.testimonialAuthorCompany,
      testimonialAuthorRole: body.testimonialAuthorRole,
      testimonialAuthorPhoto: body.testimonialAuthorPhoto,
      faqLabel: body.faqLabel,
      faqTitle: body.faqTitle,
      faqSubtitle: body.faqSubtitle,
      faqItems: body.faqItems,
      formTitle: body.formTitle,
      formLabel: body.formLabel,
      formCtaText: body.formCtaText,
      formHubspotFormId: body.formHubspotFormId,
      formFields: body.formFields,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    await put(`lp/${slug}.json`, JSON.stringify(lpData, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    invalidate(slug);

    return NextResponse.json({ success: true, slug, url: `/lp/${slug}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    console.error("Update LP error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DUPLICATE LP
export async function POST(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const sourceData = await loadLp(params.slug);
    if (!sourceData) {
      return NextResponse.json({ error: "LP source non trouvée" }, { status: 404 });
    }

    const baseSlug = sourceData.slug.replace(/-\d+$/, "");
    const existingSlugs = new Set<string>();
    try {
      const { blobs } = await list({ prefix: `lp/${baseSlug}` });
      for (const b of blobs) {
        const match = b.pathname.match(/^lp\/(.+)\.json$/);
        if (match) existingSlugs.add(match[1]);
      }
    } catch {}

    let suffix = 2;
    let newSlug = `${baseSlug}-${suffix}`;
    while (existingSlugs.has(newSlug)) { suffix++; newSlug = `${baseSlug}-${suffix}`; }

    const duplicateData: LandingPageData = {
      ...sourceData,
      slug: newSlug,
      internalTitle: `${sourceData.internalTitle} (copie)`,
      createdAt: new Date().toISOString(),
    };

    await put(`lp/${newSlug}.json`, JSON.stringify(duplicateData, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    invalidate(newSlug);

    return NextResponse.json({ success: true, slug: newSlug, url: `/lp/${newSlug}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Duplicate failed";
    console.error("Duplicate LP error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE LP
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { blobs } = await list({ prefix: `lp/${params.slug}` });
    for (const blob of blobs) await del(blob.url);
    invalidate(params.slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    console.error("Delete LP error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
