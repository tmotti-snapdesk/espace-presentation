import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { put } from "@vercel/blob";
import { LandingPageData } from "@/types/lp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug: string = body.slug?.trim().toLowerCase().replace(/\s+/g, "-");

    if (!slug) {
      return NextResponse.json({ error: "Slug requis" }, { status: 400 });
    }

    const lpData: LandingPageData = {
      slug,
      internalTitle: body.internalTitle || slug,
      heroVideoUrl: body.heroVideoUrl || "",
      heroTitle: body.heroTitle || "",
      heroSubtitle: body.heroSubtitle || "",
      heroCtaText: body.heroCtaText || "En savoir plus",
      // Optional sections — preserve whatever the client sends so that
      // filling the full form at creation time doesn't silently drop data.
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
      createdAt: new Date().toISOString(),
    };

    await put(`lp/${slug}.json`, JSON.stringify(lpData, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    revalidateTag("lp-list");
    revalidatePath(`/lp/${slug}`);
    revalidatePath("/admin/lp");

    return NextResponse.json({ success: true, slug, url: `/lp/${slug}` });
  } catch (error) {
    console.error("LP generate error:", error);
    return NextResponse.json({ error: "Création échouée" }, { status: 500 });
  }
}
