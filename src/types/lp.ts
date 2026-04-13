// ── Landing Page data model ────────────────────────────────────────────────
// Stored as espaces/<slug>.json → lp/<slug>.json in Vercel Blob.
// All fields beyond the hero are optional so that Step-1 data stays valid
// once later sections are added.

export interface LpMissionCard {
  icon: string;   // emoji used as icon
  title: string;
  text: string;
}

export interface LpLogo {
  url: string;    // Blob URL of the logo image
  alt: string;
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

  // ── Social proof (Step 3) ─────────────────────────────────────────────────
  socialProofTitle?: string;
  socialProofLogos?: LpLogo[];

  // ── Form (Step 4) ─────────────────────────────────────────────────────────
  formTitle?: string;
  formLabel?: string;
  formCtaText?: string;
  formHubspotFormId?: string;   // GUID of the HubSpot form for this campaign
}
