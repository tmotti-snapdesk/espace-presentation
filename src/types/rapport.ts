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
  targetedEmailingCount: number;
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

  hiddenSections: string[];

  createdAt: string;
  updatedAt: string;

  months: RapportMonthData[];
}

export interface RapportMonthFormData {
  month: string;

  monthlyBudget: string;
  targetedEmailingCount: string;
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
    targetedEmailingCount: 0,
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
