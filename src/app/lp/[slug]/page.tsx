import { cache } from "react";
import { notFound } from "next/navigation";
import { list } from "@vercel/blob";
import { LandingPageData } from "@/types/lp";
import LpHero from "@/components/lp/LpHero";
import LpMission from "@/components/lp/LpMission";
import LpProcess from "@/components/lp/LpProcess";
import LpUrgency from "@/components/lp/LpUrgency";
import LpSocialProof from "@/components/lp/LpSocialProof";
import LpTestimonial from "@/components/lp/LpTestimonial";
import LpFaq from "@/components/lp/LpFaq";
import LpAnchorCta from "@/components/lp/LpAnchorCta";
import LpStickyCta from "@/components/lp/LpStickyCta";
import LpLeadForm from "@/components/lp/LpLeadForm";
import { fetchHubspotFormFields } from "@/lib/hubspotFormSync";

export const revalidate = 3600;

const resolveLp = cache(async (slug: string): Promise<LandingPageData | null> => {
  try {
    const { blobs } = await list({ prefix: `lp/${slug}` });
    const jsonBlob = blobs.find((b) => b.pathname.endsWith(".json"));
    if (jsonBlob) {
      // Bypass Next's fetch cache — Vercel Blob serves the JSON with an
      // `immutable` Cache-Control header, so the cached response can stick
      // around even after revalidatePath() and mask fresh edits.
      const res = await fetch(jsonBlob.url, { cache: "no-store" });
      if (res.ok) return (await res.json()) as LandingPageData;
    }
  } catch {}
  return null;
});

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const lp = await resolveLp(params.slug);
  if (!lp) return { title: "Page non trouvée" };
  return {
    title: `${lp.heroTitle || lp.internalTitle} | Snapdesk`,
    description: lp.heroSubtitle || "",
  };
}

export default async function LpPage({ params }: { params: { slug: string } }) {
  const lp = await resolveLp(params.slug);
  if (!lp) notFound();

  const ctaText = lp.heroCtaText || "Je m'inscris";

  // Resolve which fields the lead form should display, in priority order:
  //  1. Manual override saved in the LP admin (`lp.formFields`)
  //  2. Auto-sync from the HubSpot form schema (when a GUID is set)
  //  3. The legacy 7-field default (handled inside LpLeadForm)
  let formFields = lp.formFields;
  if ((!formFields || formFields.length === 0) && lp.formHubspotFormId) {
    formFields = (await fetchHubspotFormFields(lp.formHubspotFormId)) || undefined;
  }

  // Prefer the new `testimonials` array; fall back to the legacy single-item
  // fields so LPs saved before the slider was introduced still render.
  const testimonialItems = (lp.testimonials && lp.testimonials.length > 0)
    ? lp.testimonials
    : lp.testimonialQuote
      ? [{
          quote: lp.testimonialQuote,
          authorName: lp.testimonialAuthorName,
          authorCompany: lp.testimonialAuthorCompany,
          authorRole: lp.testimonialAuthorRole,
          authorPhoto: lp.testimonialAuthorPhoto,
        }]
      : [];

  // Mirror each section's own visibility predicate so we don't render an
  // anchor CTA hanging in a vacuum after a section that didn't render.
  const missionVisible = !!(
    lp.missionLabel || lp.missionTitle || lp.missionSubtitle ||
    (lp.missionCards && lp.missionCards.length > 0)
  );
  const testimonialVisible = testimonialItems.length > 0;

  return (
    <main>
      <LpHero
        videoUrl={lp.heroVideoUrl}
        title={lp.heroTitle}
        subtitle={lp.heroSubtitle}
        ctaText={lp.heroCtaText}
      />

      <LpMission
        label={lp.missionLabel}
        title={lp.missionTitle}
        subtitle={lp.missionSubtitle}
        cards={lp.missionCards}
        photos={lp.missionPhotos}
      />
      {missionVisible && <LpAnchorCta text={ctaText} />}

      <LpProcess
        label={lp.processLabel}
        title={lp.processTitle}
        subtitle={lp.processSubtitle}
        steps={lp.processSteps}
      />

      <LpTestimonial items={testimonialItems} />
      {testimonialVisible && <LpAnchorCta text={ctaText} />}

      <LpSocialProof
        title={lp.socialProofTitle}
        logos={lp.socialProofLogos}
        showGoogleRating={lp.socialProofShowGoogleRating}
      />

      <LpUrgency
        label={lp.urgencyLabel}
        title={lp.urgencyTitle}
        subtitle={lp.urgencySubtitle}
        steps={lp.urgencySteps}
        deadline={lp.urgencyDeadline}
        expiredText={lp.urgencyExpiredText}
      />

      <LpLeadForm
        title={lp.formTitle}
        label={lp.formLabel}
        ctaText={lp.formCtaText}
        hubspotFormId={lp.formHubspotFormId}
        fields={formFields}
        lpSlug={lp.slug}
        lpTitle={lp.heroTitle || lp.internalTitle}
      />

      <LpFaq
        label={lp.faqLabel}
        title={lp.faqTitle}
        subtitle={lp.faqSubtitle}
        items={lp.faqItems}
      />

      <LpStickyCta text={ctaText} />
    </main>
  );
}
