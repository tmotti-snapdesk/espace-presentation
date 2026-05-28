import { RapportData } from "@/types/rapport";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "rapports");

export function getAllRapports(): RapportData[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const content = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    return JSON.parse(content) as RapportData;
  });
}

export function getRapportsByEspaceSlug(espaceSlug: string): RapportData[] {
  return getAllRapports().filter((r) => r.espaceSlug === espaceSlug);
}

export function getRapportByKey(espaceSlug: string, month: string): RapportData | null {
  const filePath = path.join(DATA_DIR, `${espaceSlug}-${month}.json`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as RapportData;
}

export function rapportBlobPath(espaceSlug: string, month: string): string {
  return `rapports/${espaceSlug}-${month}.json`;
}

export function rapportBlobPrefix(espaceSlug: string): string {
  return `rapports/${espaceSlug}-`;
}
