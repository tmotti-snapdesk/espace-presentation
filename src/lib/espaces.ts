import { EspaceData } from "@/types/espace";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "espaces");

export function getAllEspaces(): EspaceData[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const content = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    return JSON.parse(content) as EspaceData;
  });
}

export function getEspaceBySlug(slug: string): EspaceData | null {
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as EspaceData;
}

export function saveEspace(data: EspaceData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const filePath = path.join(DATA_DIR, `${data.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
