import { RapportData, emptyDistribution } from "@/types/rapport";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "rapports");

/**
 * Back-fills missing fields on a raw rapport object with safe defaults.
 *
 * Reports persisted to Blob storage before a schema change keep their old
 * shape, so newer fields (e.g. targetedEmailingCount, upcomingActions,
 * anonymizeVisitProspects) are absent. Rendering accesses array fields with
 * `.length`/`.map`, which throws on `undefined` and turns the page into a 500.
 * Normalising on read keeps legacy reports renderable.
 */
export function normalizeRapportData(raw: Partial<RapportData> & Record<string, unknown>): RapportData {
  return {
    espaceSlug: (raw.espaceSlug as string) ?? "",
    espaceName: (raw.espaceName as string) ?? "",
    espaceAddress: (raw.espaceAddress as string) ?? "",
    marketingStartDate: (raw.marketingStartDate as string) ?? "",
    month: (raw.month as string) ?? "",
    ownerName: (raw.ownerName as string) ?? "",
    intro: (raw.intro as string) ?? "",
    monthlyBudget: (raw.monthlyBudget as string) ?? "",
    targetedEmailingCount: Number(raw.targetedEmailingCount) || 0,
    matchingFormsCount: Number(raw.matchingFormsCount) || 0,
    preselectionCount: Number(raw.preselectionCount) || 0,
    brokersListingActive: Boolean(raw.brokersListingActive),
    brokersListingCount: Number(raw.brokersListingCount) || 450,
    distribution: { ...emptyDistribution(), ...(raw.distribution || {}) },
    otherMarketingActions: Array.isArray(raw.otherMarketingActions) ? raw.otherMarketingActions : [],
    prospectionActions: Array.isArray(raw.prospectionActions) ? raw.prospectionActions : [],
    upcomingActions: Array.isArray(raw.upcomingActions) ? raw.upcomingActions : [],
    anonymizeVisitProspects: Boolean(raw.anonymizeVisitProspects),
    visites: Array.isArray(raw.visites) ? raw.visites : [],
    recommendations: Array.isArray(raw.recommendations) ? raw.recommendations : [],
    similarEspaces: Array.isArray(raw.similarEspaces) ? raw.similarEspaces : [],
    presentationUrl: (raw.presentationUrl as string) ?? "",
    createdAt: (raw.createdAt as string) ?? "",
    updatedAt: (raw.updatedAt as string) ?? "",
  };
}

export function getAllRapports(): RapportData[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const content = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    return normalizeRapportData(JSON.parse(content));
  });
}

export function getRapportsByEspaceSlug(espaceSlug: string): RapportData[] {
  return getAllRapports().filter((r) => r.espaceSlug === espaceSlug);
}

export function getRapportByKey(espaceSlug: string, month: string): RapportData | null {
  const filePath = path.join(DATA_DIR, `${espaceSlug}-${month}.json`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  return normalizeRapportData(JSON.parse(content));
}

export function rapportBlobPath(espaceSlug: string, month: string): string {
  return `rapports/${espaceSlug}-${month}.json`;
}

export function rapportBlobPrefix(espaceSlug: string): string {
  return `rapports/${espaceSlug}-`;
}
