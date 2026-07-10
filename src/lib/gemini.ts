export interface ReformulateVisiteInput {
  espaceName?: string;
  client: string;
  arrondissement: string;
  sales: string;
  broker: string;
  loi: string;
  nombreVisite: string;
  feedbacksRaw: string;
  /** Extra guidance from an admin when regenerating (e.g. "insiste sur le prix"). */
  extraInstruction?: string;
}

export interface ReformulateVisiteOutput {
  feedback: string;
  outcome: string;
}

function buildPrompt(input: ReformulateVisiteInput): string {
  return `Tu es un consultant en immobilier d'entreprise qui rédige les comptes rendus de visite d'un rapport de commercialisation professionnel destiné à un propriétaire d'espace de bureaux.

À partir des notes brutes d'un commercial (BizDev) prises après une visite, rédige :
- "feedback" : un paragraphe de 2 à 4 phrases reformulant les impressions et retours du prospect, dans un style factuel, professionnel et à la troisième personne (pas de langage familier, pas de première personne).
- "outcome" : une phrase courte résumant la suite donnée à cette visite (ex: "Proposition envoyée, relance prévue le...", "LOI en cours de signature", "Prospect non retenu — budget insuffisant").

Contexte de la visite :
- Espace visité : ${input.espaceName || "non renseigné"}
- Prospect : ${input.client || "non renseigné"}
- Arrondissement : ${input.arrondissement || "non renseigné"}
- Commercial (BizDev) : ${input.sales || "non renseigné"}
- Broker impliqué : ${input.broker || "aucun"}
- Nombre de visites effectuées : ${input.nombreVisite || "non renseigné"}
- LOI (lettre d'intention) : ${input.loi || "non renseigné"}
- Notes brutes du commercial : ${input.feedbacksRaw || "aucune note fournie"}
${input.extraInstruction ? `\nConsigne supplémentaire de l'admin : ${input.extraInstruction}` : ""}

Réponds uniquement avec un objet JSON de la forme {"feedback": "...", "outcome": "..."}, sans texte autour.`;
}

/**
 * Calls the Gemini API to turn a BizDev's raw visit notes into a polished
 * feedback/outcome pair, matching the tone of the rest of the rapport.
 */
export async function reformulateVisite(
  input: ReformulateVisiteInput
): Promise<ReformulateVisiteOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY n'est pas configurée");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(input) }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Réponse Gemini vide ou inattendue");

  const parsed = JSON.parse(text);
  return {
    feedback: String(parsed.feedback || ""),
    outcome: String(parsed.outcome || ""),
  };
}
