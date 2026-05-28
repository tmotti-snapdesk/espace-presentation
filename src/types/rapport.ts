export interface RapportVisite {
  id: string;
  date: string;
  prospect: string;
  activity: string;
  workstations: string;
  feedback: string;
  outcome: string;
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

export interface RapportData {
  espaceSlug: string;
  espaceName: string;
  espaceAddress: string;
  marketingStartDate: string;
  month: string;
  ownerName: string;
  intro: string;

  monthlyBudget: string;
  totalBudget: string;
  matchingFormsCount: number;
  preselectionCount: number;
  brokersListingActive: boolean;
  brokersListingCount: number;
  distribution: RapportDistribution;
  otherMarketingActions: string[];

  prospectionActions: string[];

  visites: RapportVisite[];
  recommendations: string[];
  similarEspaces: SimilarEspace[];

  createdAt: string;
  updatedAt: string;
}

export interface RapportFormData {
  month: string;
  ownerName: string;
  espaceAddress: string;
  marketingStartDate: string;
  intro: string;

  monthlyBudget: string;
  totalBudget: string;
  matchingFormsCount: string;
  preselectionCount: string;
  brokersListingActive: boolean;
  brokersListingCount: string;
  distribution: RapportDistribution;
  otherMarketingActions: string;

  prospectionActions: string;

  visites: RapportVisite[];
  recommendations: string;
  similarEspaces: SimilarEspace[];
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
