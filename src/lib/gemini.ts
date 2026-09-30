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
 * Calls Gemini and returns the raw JSON text of its answer.
 * If the configured model no longer exists (HTTP 404 — Google retires model
 * versions), falls back to the "gemini-flash-latest" alias, which always
 * points to the current Flash model.
 */
async function generateJson(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY n'est pas configurée");
  const models = Array.from(new Set([process.env.GEMINI_MODEL || "gemini-2.5-flash", "gemini-flash-latest"]));

  let lastError: Error | null = null;
  for (const model of models) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      lastError = new Error(`Gemini API error (${res.status}): ${body}`);
      if (res.status === 404) continue; // modèle retiré : on essaie le suivant
      throw lastError;
    }
    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Réponse Gemini vide ou inattendue");
    return text;
  }
  throw lastError || new Error("Aucun modèle Gemini disponible");
}

/**
 * Calls the Gemini API to turn a BizDev's raw visit notes into a polished
 * feedback/outcome pair, matching the tone of the rest of the rapport.
 */
export async function reformulateVisite(
  input: ReformulateVisiteInput
): Promise<ReformulateVisiteOutput> {
  const text = await generateJson(buildPrompt(input));

  const parsed = JSON.parse(text);
  return {
    feedback: String(parsed.feedback || ""),
    outcome: String(parsed.outcome || ""),
  };
}

export interface VisiteForSummary {
  date: string;
  sales: string;
  client: string;
  broker: string;
  loi: string;
  feedback: string;
}

export interface EspaceSummary {
  /** Ce qui va bien dans l'espace. */
  forts: string[];
  /** Ce qu'ont dit les clients (retours, intérêt, suites). */
  clients: string[];
  /** Les choses à améliorer. */
  ameliorer: string[];
}

function buildSummaryPrompt(espaceName: string, visites: VisiteForSummary[]): string {
  const lines = visites
    .map(
      (v) =>
        `- ${v.date} · BizDev : ${v.sales || "?"} · Prospect : ${v.client || "?"} · Broker : ${v.broker || "?"} · LOI : ${v.loi || "?"}\n  Notes : ${v.feedback}`
    )
    .join("\n");
  return `Tu es consultant en immobilier de bureaux chez Snapdesk. Voici tous les comptes rendus de visite de l'espace « ${espaceName} » depuis janvier 2026, du plus ancien au plus récent.

${lines}

Rédige un compte rendu général de l'espace, en français, en trois listes de points courts (une phrase chacun, 2 à 5 points par liste) :
- "forts" : ce qui plaît et fonctionne bien dans l'espace (points cités par plusieurs visiteurs en priorité) ;
- "clients" : ce qu'ont dit les clients — niveau d'intérêt, LOI obtenues ou en cours, raisons de refus, tendances ; cite le nom du prospect quand c'est utile ;
- "ameliorer" : les freins et les choses à améliorer, les plus fréquents d'abord.

Reste strictement factuel : n'invente rien qui ne figure pas dans les notes. Style professionnel, sans langage familier.

Réponds uniquement avec un objet JSON de la forme {"forts": ["..."], "clients": ["..."], "ameliorer": ["..."]}, sans texte autour.`;
}

/**
 * Asks Gemini for a general report of a space from all its visit notes.
 */
export async function summarizeEspace(
  espaceName: string,
  visites: VisiteForSummary[]
): Promise<EspaceSummary> {
  const text = await generateJson(buildSummaryPrompt(espaceName, visites));

  const parsed = JSON.parse(text);
  const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : []);
  return { forts: list(parsed.forts), clients: list(parsed.clients), ameliorer: list(parsed.ameliorer) };
}
