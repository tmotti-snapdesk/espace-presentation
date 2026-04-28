// ── Landing Page data model ────────────────────────────────────────────────
// Stored as espaces/<slug>.json → lp/<slug>.json in Vercel Blob.
// All fields beyond the hero are optional so that Step-1 data stays valid
// once later sections are added.

export interface LpMissionCard {
  icon: string;        // emoji used as icon — fallback when no image is set
  iconImage?: string;  // optional Blob URL of a custom picto image
  title: string;
  text: string;
}

export interface LpLogo {
  url: string;    // Blob URL of the logo image
  alt: string;
}

export interface LpProcessStep {
  title: string;
  text: string;
}

export interface LpFaqItem {
  question: string;
  answer: string;
}

export interface LandingPageData {
  slug: string;
  internalTitle: string;  // shown only in admin (e.g. "Campagne Office Manager Q2")
  createdAt: string;

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroVideoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;      // text of the CTA button (anchors to #form)

  // ── Notre métier (Step 2) ─────────────────────────────────────────────────
  missionLabel?: string;    // small all-caps label above the title
  missionTitle?: string;
  missionSubtitle?: string;
  missionCards?: LpMissionCard[];
  missionPhotos?: string[];  // optional carousel shown to the right of the cards

  // ── Process / Comment ça marche (optional, between Mission and Social proof)
  processLabel?: string;
  processTitle?: string;
  processSubtitle?: string;
  processSteps?: LpProcessStep[];

  // ── Urgency (optional, displayed before the lead form to drive conversion)
  // Steps on the left, countdown ticking down to `urgencyDeadline` on the right.
  urgencyLabel?: string;
  urgencyTitle?: string;
  urgencySubtitle?: string;
  urgencySteps?: LpProcessStep[];
  urgencyDeadline?: string;   // ISO datetime, e.g. "2026-06-30T23:59:00+02:00"
  urgencyExpiredText?: string; // shown once the deadline is past

  // ── Social proof (Step 3) ─────────────────────────────────────────────────
  socialProofTitle?: string;
  socialProofLogos?: LpLogo[];

  // ── Testimonial (optional quote block) ────────────────────────────────────
  testimonialQuote?: string;
  testimonialAuthorName?: string;
  testimonialAuthorCompany?: string;
  testimonialAuthorRole?: string;
  testimonialAuthorPhoto?: string;   // Blob URL of the author's portrait

  // ── FAQ (optional, displayed just before the form) ────────────────────────
  faqLabel?: string;
  faqTitle?: string;
  faqSubtitle?: string;
  faqItems?: LpFaqItem[];

  // ── Form (Step 4) ─────────────────────────────────────────────────────────
  formTitle?: string;
  formLabel?: string;
  formCtaText?: string;
  formHubspotFormId?: string;   // GUID of the HubSpot form for this campaign
}
