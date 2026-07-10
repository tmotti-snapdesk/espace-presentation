/** Raw columns of a row from the BizDev "comptes rendus de visite" Google Sheet. */
export interface PendingVisiteRaw {
  date: string;
  mois: string;
  annee: string;
  espace: string;
  arrondissement: string;
  client: string;
  sales: string;
  broker: string;
  nombreVisite: string;
  loi: string;
  feedbacks: string;
}

/**
 * A visite ingested from the Google Sheet, reformulated by Gemini, waiting
 * for an admin to review/edit it before it can be published into the
 * corresponding espace's rapport.
 */
export interface PendingVisite {
  id: string;
  createdAt: string;
  updatedAt: string;
  sheetRowRef: string;
  raw: PendingVisiteRaw;

  suggestedEspaceSlug: string | null;
  espaceSlug: string | null;
  month: string;
  prospect: string;
  feedback: string;
  outcome: string;

  geminiError: string | null;
  status: "pending" | "published" | "rejected";
}
