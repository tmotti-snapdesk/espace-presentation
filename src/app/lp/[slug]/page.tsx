import { cache } from "react";
import { notFound } from "next/navigation";
import { list } from "@vercel/blob";
import { LandingPageData } from "@/types/lp";
import LpHero from "@/components/lp/LpHero";
import LpMission from "@/components/lp/LpMission";
import LpProcess from "@/components/lp/LpProcess";
import LpSocialProof from "@/components/lp/LpSocialProof";
import LpTestimonial from "@/components/lp/LpTestimonial";
import LpFaq from "@/components/lp/LpFaq";
import LpAnchorCta from "@/components/lp/LpAnchorCta";
import LpStickyCta from "@/components/lp/LpStickyCta";
import LpLeadForm from "@/components/lp/LpLeadForm";

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

  // Mirror each section's own visibility predicate so we don't render an
  // anchor CTA hanging in a vacuum after a section that didn't render.
  const missionVisible = !!(
    lp.missionLabel || lp.missionTitle || lp.missionSubtitle ||
    (lp.missionCards && lp.missionCards.length > 0)
  );
  const processVisible = !!(
    lp.processLabel || lp.processTitle || lp.processSubtitle ||
    (lp.processSteps && lp.processSteps.length > 0)
  );
  const testimonialVisible = !!lp.testimonialQuote;

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
      />
      {missionVisible && <LpAnchorCta text={ctaText} />}

      <LpProcess
        label={lp.processLabel}
        title={lp.processTitle}
        subtitle={lp.processSubtitle}
        steps={lp.processSteps}
      />
      {processVisible && <LpAnchorCta text={ctaText} />}

      <LpSocialProof
        title={lp.socialProofTitle}
        logos={lp.socialProofLogos}
      />

      <LpTestimonial
        quote={lp.testimonialQuote}
        authorName={lp.testimonialAuthorName}
        authorCompany={lp.testimonialAuthorCompany}
        authorRole={lp.testimonialAuthorRole}
        authorPhoto={lp.testimonialAuthorPhoto}
      />
      {testimonialVisible && <LpAnchorCta text={ctaText} />}

      <LpFaq
        label={lp.faqLabel}
        title={lp.faqTitle}
        subtitle={lp.faqSubtitle}
        items={lp.faqItems}
      />

      <LpLeadForm
        title={lp.formTitle}
        label={lp.formLabel}
        ctaText={lp.formCtaText}
        hubspotFormId={lp.formHubspotFormId}
        lpSlug={lp.slug}
        lpTitle={lp.heroTitle || lp.internalTitle}
      />

      <LpStickyCta text={ctaText} />
    </main>
  );
}
