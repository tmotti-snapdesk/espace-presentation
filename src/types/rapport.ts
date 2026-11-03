export interface RapportVisite {
  id: string;
  date: string;
  prospect: string;
  activity: string;
  workstations: string;
  feedback: string;
  outcome: string;
  // Visites remontées automatiquement depuis le Google Sheet des BizDev et
  // reformulées par Gemini restent "pending" tant qu'un admin ne les a pas
  // validées : elles ne doivent jamais s'afficher sur le rapport public.
  status?: "pending" | "published";
  rawNotes?: string;
}

export interface SimilarEspace {
  id: string;
  name: string;
  url: string;
  price: string;
  workstations: string;
  description: string;
  image: string;
  // Champs de comparaison (étude de marché), absents des anciens rapports.
  location?: string;
  surface?: string;
  pricePerWorkstation?: string;
}

/** Lien libre ajouté par un BizDev (affiché comme bouton en tête du rapport). */
export interface RapportLink {
  id: string;
  label: string;
  url: string;
}

/**
 * Étude de marché : les offres comparables sont dans `similarEspaces` ; ici on
 * stocke les caractéristiques de l'espace du propriétaire (pour la ligne
 * « Votre espace » du tableau comparatif) et un commentaire facultatif.
 */
export interface MarketStudyOwnAsset {
  workstations: string;
  surface: string;
  price: string;
  pricePerWorkstation: string;
}

export interface RapportMarketStudy {
  ownAsset: MarketStudyOwnAsset;
  comment: string;
}

export function emptyMarketStudy(): RapportMarketStudy {
  return {
    ownAsset: { workstations: "", surface: "", price: "", pricePerWorkstation: "" },
    comment: "",
  };
}

export interface RapportDistribution {
  bureauxLocaux: boolean;
  ubiq: boolean;
  spliit: boolean;
  flashoffice: boolean;
  placeImmobilier: boolean;
}

export interface RapportMonthData {
  month: string;

  monthlyBudget: string;
  matchingFormsCount: number;
  preselectionCount: number;
  brokersListingActive: boolean;
  brokersListingCount: number;
  distribution: RapportDistribution;
  otherMarketingActions: string[];

  prospectionActions: string[];
  upcomingActions: string[];

  visites: RapportVisite[];
}

export interface RapportData {
  espaceSlug: string;
  espaceName: string;
  espaceAddress: string;
  marketingStartDate: string;
  ownerName: string;
  intro: string;

  anonymizeVisitProspects: boolean;
  recommendations: string[];
  similarEspaces: SimilarEspace[];

  presentationUrl: string;
  // Optionnels : absents des rapports créés avant leur ajout.
  extraLinks?: RapportLink[];
  marketStudy?: RapportMarketStudy;

  hiddenSections: string[];

  createdAt: string;
  updatedAt: string;

  months: RapportMonthData[];
}

export interface RapportMonthFormData {
  month: string;

  monthlyBudget: string;
  matchingFormsCount: string;
  preselectionCount: string;
  brokersListingActive: boolean;
  brokersListingCount: string;
  distribution: RapportDistribution;
  otherMarketingActions: string;

  prospectionActions: string;
  upcomingActions: string;

  visites: RapportVisite[];
}

export interface RapportFormData {
  ownerName: string;
  espaceAddress: string;
  marketingStartDate: string;
  intro: string;

  anonymizeVisitProspects: boolean;
  recommendations: string;
  similarEspaces: SimilarEspace[];

  presentationUrl: string;
  extraLinks: RapportLink[];
  marketStudy: RapportMarketStudy;

  hiddenSections: string[];

  months: RapportMonthFormData[];
}

export const DISTRIBUTION_LABELS: Record<keyof RapportDistribution, string> = {
  bureauxLocaux: "Bureaux Locaux",
  ubiq: "Ubiq",
  spliit: "Spliit",
  flashoffice: "Flashoffice",
  placeImmobilier: "La Place de l'Immobilier",
};

export function emptyDistribution(): RapportDistribution {
  return {
    bureauxLocaux: false,
    ubiq: false,
    spliit: false,
    flashoffice: false,
    placeImmobilier: false,
  };
}

export function emptyRapportMonth(month: string): RapportMonthData {
  return {
    month,
    monthlyBudget: "",
    matchingFormsCount: 0,
    preselectionCount: 0,
    brokersListingActive: true,
    brokersListingCount: 450,
    distribution: emptyDistribution(),
    otherMarketingActions: [],
    prospectionActions: [],
    upcomingActions: [],
    visites: [],
  };
}

export function findRapportMonth(
  rapport: Pick<RapportData, "months">,
  month: string
): RapportMonthData | null {
  return rapport.months.find((m) => m.month === month) || null;
}

export function sortMonthsDesc(months: RapportMonthData[]): RapportMonthData[] {
  return [...months].sort((a, b) => b.month.localeCompare(a.month));
}

/** Visites les plus récentes en premier ; une visite sans date passe en dernier. */
export function sortVisitesDesc(visites: RapportVisite[]): RapportVisite[] {
  return [...visites].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export function formatMonthLabel(month: string): string {
  if (!/^\d{4}-\d{2}$/.test(month)) return month;
  const [year, monthNum] = month.split("-");
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function formatLongDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);
}

export function joinLines(items: string[]): string {
  return items.join("\n");
}
