const FRENCH_MONTHS: Record<string, string> = {
  janvier: "01",
  fevrier: "02",
  février: "02",
  mars: "03",
  avril: "04",
  mai: "05",
  juin: "06",
  juillet: "07",
  aout: "08",
  août: "08",
  septembre: "09",
  octobre: "10",
  novembre: "11",
  decembre: "12",
  décembre: "12",
};

/**
 * Turns a BizDev Sheet's "Mois" (French name or number) + "Année" columns
 * into a "YYYY-MM" string, falling back to parsing the "Date" column.
 */
export function toReportMonth(mois: string, annee: string, dateFallback: string): string {
  const year = annee.trim();
  const monthRaw = mois.trim().toLowerCase();

  if (/^\d{4}$/.test(year)) {
    if (/^\d{1,2}$/.test(monthRaw)) {
      return `${year}-${monthRaw.padStart(2, "0")}`;
    }
    const monthNum = FRENCH_MONTHS[monthRaw];
    if (monthNum) return `${year}-${monthNum}`;
  }

  const parsed = new Date(dateFallback);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
  }

  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
