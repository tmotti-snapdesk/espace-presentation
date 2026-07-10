"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RapportData,
  RapportFormData,
  RapportMonthFormData,
  RapportVisite,
  SimilarEspace,
  RapportDistribution,
  DISTRIBUTION_LABELS,
  formatMonthLabel,
  splitLines,
  joinLines,
  emptyDistribution,
} from "@/types/rapport";

interface RapportFormProps {
  mode: "create" | "edit";
  espaceSlug: string;
  espaceName: string;
  espaceAddress: string;
  initialData?: RapportData;
  initialActiveMonth?: string;
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyVisite(): RapportVisite {
  return {
    id: uid("vis"),
    date: "",
    prospect: "",
    activity: "",
    workstations: "",
    feedback: "",
    outcome: "",
  };
}

function emptySimilar(): SimilarEspace {
  return {
    id: uid("sim"),
    name: "",
    url: "",
    price: "",
    workstations: "",
    description: "",
    image: "",
  };
}

function defaultMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonthAfter(month: string): string {
  if (!/^\d{4}-\d{2}$/.test(month)) return defaultMonth();
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m, 1); // JS months are 0-based, so passing `m` (1-12) lands on the next month
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function emptyMonthForm(month: string): RapportMonthFormData {
  return {
    month,
    monthlyBudget: "",
    targetedEmailingCount: "",
    matchingFormsCount: "",
    preselectionCount: "",
    brokersListingActive: true,
    brokersListingCount: "450",
    distribution: emptyDistribution(),
    otherMarketingActions: "",
    prospectionActions: "",
    upcomingActions: "",
    visites: [emptyVisite()],
  };
}

function monthToForm(m: RapportData["months"][number]): RapportMonthFormData {
  return {
    month: m.month,
    monthlyBudget: m.monthlyBudget,
    targetedEmailingCount: String(m.targetedEmailingCount ?? ""),
    matchingFormsCount: String(m.matchingFormsCount ?? ""),
    preselectionCount: String(m.preselectionCount ?? ""),
    brokersListingActive: m.brokersListingActive,
    brokersListingCount: String(m.brokersListingCount || 450),
    distribution: { ...emptyDistribution(), ...m.distribution },
    otherMarketingActions: joinLines(m.otherMarketingActions),
    prospectionActions: joinLines(m.prospectionActions),
    upcomingActions: joinLines(m.upcomingActions || []),
    visites: m.visites.length > 0 ? m.visites : [emptyVisite()],
  };
}

export default function RapportForm({
  mode,
  espaceSlug,
  espaceName,
  espaceAddress,
  initialData,
  initialActiveMonth,
}: RapportFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const [form, setForm] = useState<RapportFormData>(() => {
    if (initialData) {
      return {
        ownerName: initialData.ownerName,
        espaceAddress: initialData.espaceAddress || espaceAddress,
        marketingStartDate: initialData.marketingStartDate,
        intro: initialData.intro,
        anonymizeVisitProspects: initialData.anonymizeVisitProspects ?? false,
        recommendations: joinLines(initialData.recommendations),
        similarEspaces:
          initialData.similarEspaces.length > 0
            ? initialData.similarEspaces
            : [emptySimilar()],
        presentationUrl: initialData.presentationUrl || "",
        hiddenSections: initialData.hiddenSections || [],
        months:
          initialData.months.length > 0
            ? initialData.months.map(monthToForm)
            : [emptyMonthForm(defaultMonth())],
      };
    }
    return {
      ownerName: "",
      espaceAddress,
      marketingStartDate: "",
      intro: "",
      anonymizeVisitProspects: false,
      recommendations: "",
      similarEspaces: [emptySimilar()],
      presentationUrl: "",
      hiddenSections: [],
      months: [emptyMonthForm(defaultMonth())],
    };
  });

  const [activeMonthIndex, setActiveMonthIndex] = useState(() => {
    if (initialActiveMonth) {
      const idx = form.months.findIndex((m) => m.month === initialActiveMonth);
      if (idx >= 0) return idx;
    }
    return 0;
  });

  const activeMonth = form.months[activeMonthIndex];

  const updateField = <K extends keyof RapportFormData>(key: K, value: RapportFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateMonth = <K extends keyof RapportMonthFormData>(
    key: K,
    value: RapportMonthFormData[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      months: prev.months.map((m, i) => (i === activeMonthIndex ? { ...m, [key]: value } : m)),
    }));
  };

  const toggleDistribution = (key: keyof RapportDistribution) => {
    setForm((prev) => ({
      ...prev,
      months: prev.months.map((m, i) =>
        i === activeMonthIndex
          ? { ...m, distribution: { ...m.distribution, [key]: !m.distribution[key] } }
          : m
      ),
    }));
  };

  const toggleSection = (id: string) => {
    setForm((prev) => ({
      ...prev,
      hiddenSections: prev.hiddenSections.includes(id)
        ? prev.hiddenSections.filter((s) => s !== id)
        : [...prev.hiddenSections, id],
    }));
  };

  const isHidden = (id: string) => form.hiddenSections.includes(id);

  const addMonth = () => {
    const latest = form.months.reduce((max, m) => (m.month > max ? m.month : max), form.months[0]?.month || defaultMonth());
    const newMonth = emptyMonthForm(nextMonthAfter(latest));
    setForm((prev) => ({ ...prev, months: [...prev.months, newMonth] }));
    setActiveMonthIndex(form.months.length);
  };

  const removeMonth = (index: number) => {
    if (form.months.length <= 1) return;
    if (!confirm(`Supprimer l'onglet ${formatMonthLabel(form.months[index].month)} ?`)) return;
    setForm((prev) => ({ ...prev, months: prev.months.filter((_, i) => i !== index) }));
    setActiveMonthIndex((prev) => (prev >= index ? Math.max(0, prev - 1) : prev));
  };

  const updateVisite = (id: string, patch: Partial<RapportVisite>) => {
    setForm((prev) => ({
      ...prev,
      months: prev.months.map((m, i) =>
        i === activeMonthIndex
          ? { ...m, visites: m.visites.map((v) => (v.id === id ? { ...v, ...patch } : v)) }
          : m
      ),
    }));
  };

  const removeVisite = (id: string) => {
    setForm((prev) => ({
      ...prev,
      months: prev.months.map((m, i) =>
        i === activeMonthIndex ? { ...m, visites: m.visites.filter((v) => v.id !== id) } : m
      ),
    }));
  };

  const updateSimilar = (id: string, patch: Partial<SimilarEspace>) => {
    setForm((prev) => ({
      ...prev,
      similarEspaces: prev.similarEspaces.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    }));
  };

  const removeSimilar = (id: string) => {
    setForm((prev) => ({
      ...prev,
      similarEspaces: prev.similarEspaces.filter((s) => s.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setGeneratedUrl(null);

    try {
      for (const m of form.months) {
        if (!/^\d{4}-\d{2}$/.test(m.month)) {
          throw new Error(`Le mois "${m.month}" doit être au format YYYY-MM`);
        }
      }
      const monthValues = form.months.map((m) => m.month);
      if (new Set(monthValues).size !== monthValues.length) {
        throw new Error("Chaque mois ne peut apparaître qu'une seule fois dans le rapport.");
      }

      const generalPayload = {
        espaceSlug,
        espaceName,
        espaceAddress: form.espaceAddress,
        marketingStartDate: form.marketingStartDate,
        ownerName: form.ownerName,
        intro: form.intro,
        anonymizeVisitProspects: form.anonymizeVisitProspects,
        recommendations: splitLines(form.recommendations),
        similarEspaces: form.similarEspaces.filter((s) => s.name.trim()),
        presentationUrl: form.presentationUrl.trim(),
        hiddenSections: form.hiddenSections,
      };

      const monthsPayload = form.months.map((m) => ({
        month: m.month,
        monthlyBudget: m.monthlyBudget,
        targetedEmailingCount: m.targetedEmailingCount,
        matchingFormsCount: m.matchingFormsCount,
        preselectionCount: m.preselectionCount,
        brokersListingActive: m.brokersListingActive,
        brokersListingCount: m.brokersListingCount,
        distribution: m.distribution,
        otherMarketingActions: splitLines(m.otherMarketingActions),
        prospectionActions: splitLines(m.prospectionActions),
        upcomingActions: splitLines(m.upcomingActions),
        visites: m.visites.filter((v) => v.prospect.trim() || v.feedback.trim()),
      }));

      const endpoint = mode === "edit" ? `/api/rapports/${espaceSlug}` : `/api/rapports`;
      const method = mode === "edit" ? "PUT" : "POST";
      const body =
        mode === "edit"
          ? { ...generalPayload, months: monthsPayload }
          : { ...generalPayload, ...monthsPayload[0] };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue");
      setGeneratedUrl(
        mode === "edit"
          ? `/espaces/${espaceSlug}/rapports/${activeMonth.month}`
          : data.url
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const title = mode === "edit" ? `Rapport — ${espaceName}` : `Nouveau rapport — ${espaceName}`;

  return (
    <main className="min-h-screen bg-luxury-cream">
      <div className="bg-luxury-charcoal text-white py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="luxury-label text-luxury-gold mb-1">Snapdesk &middot; Rapport</p>
            <h1 className="font-serif text-2xl">{title}</h1>
          </div>
          <Link
            href={`/admin/${espaceSlug}/rapports`}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            &larr; Rapports
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto py-12 px-6 md:px-12">
        {generatedUrl && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium mb-2">
              {mode === "edit" ? "Rapport mis à jour !" : "Rapport créé avec succès !"}
            </p>
            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 underline hover:text-green-800"
            >
              Voir le rapport &rarr;
            </a>
          </div>
        )}

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <SectionTitle>Informations générales</SectionTitle>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Field label="Commercialisé depuis">
            <input
              type="date"
              value={form.marketingStartDate}
              onChange={(e) => updateField("marketingStartDate", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Adresse de l'espace">
            <input
              type="text"
              value={form.espaceAddress}
              onChange={(e) => updateField("espaceAddress", e.target.value)}
              className={inputCls}
              placeholder="ex: 42 rue de Rivoli, 75004 Paris"
            />
          </Field>
          <Field label="Destinataire (propriétaire)">
            <input
              type="text"
              value={form.ownerName}
              onChange={(e) => updateField("ownerName", e.target.value)}
              className={inputCls}
              placeholder="ex: M. Lefèvre"
            />
          </Field>
          <Field label="Lien vers la présentation commerciale" full>
            <input
              type="url"
              value={form.presentationUrl}
              onChange={(e) => updateField("presentationUrl", e.target.value)}
              className={inputCls}
              placeholder="https://..."
            />
            <p className="text-xs text-luxury-slate mt-2">
              Un bouton « Voir la présentation commerciale » apparaîtra dans le hero
              du rapport si l&apos;URL est renseignée.
            </p>
          </Field>
          <Field
            label="Synthèse / introduction"
            full
            hidden={isHidden("intro")}
            onToggle={() => toggleSection("intro")}
          >
            <textarea
              value={form.intro}
              onChange={(e) => updateField("intro", e.target.value)}
              rows={4}
              className={inputCls + " resize-vertical"}
              placeholder="Quelques lignes pour introduire le rapport."
            />
          </Field>
        </div>

        <div className="flex items-center justify-between mb-6 pb-3 border-b border-primary-200">
          <h2 className="font-serif text-2xl text-luxury-charcoal">Suivi mensuel</h2>
          <button
            type="button"
            onClick={addMonth}
            className="text-sm text-luxury-gold hover:text-luxury-charcoal transition-colors"
          >
            + Ajouter un mois
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          {form.months.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveMonthIndex(i)}
              className={`px-4 py-2 text-sm rounded-full border transition-colors capitalize ${
                i === activeMonthIndex
                  ? "bg-luxury-charcoal text-white border-luxury-charcoal"
                  : "bg-white text-luxury-charcoal border-primary-200 hover:border-primary-300"
              }`}
            >
              {formatMonthLabel(m.month) || "Nouveau mois"}
            </button>
          ))}
        </div>

        <div className="mb-8 grid md:grid-cols-2 gap-6">
          <Field label="Mois de cet onglet *">
            <input
              type="month"
              required
              value={activeMonth.month}
              onChange={(e) => updateMonth("month", e.target.value)}
              className={inputCls}
            />
          </Field>
          {form.months.length > 1 && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeMonth(activeMonthIndex)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Supprimer cet onglet
              </button>
            </div>
          )}
        </div>

        <SectionTitle
          hidden={isHidden("marketing")}
          onToggle={() => toggleSection("marketing")}
        >
          Section marketing
        </SectionTitle>
        <BlockHeader
          label="Indicateurs clés"
          hidden={isHidden("marketing.kpis")}
          onToggle={() => toggleSection("marketing.kpis")}
        />
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Field label="Budget marketing du mois">
            <input
              type="text"
              value={activeMonth.monthlyBudget}
              onChange={(e) => updateMonth("monthlyBudget", e.target.value)}
              className={inputCls}
              placeholder="ex: 1 250 €"
            />
          </Field>
          <Field label="Contacts ayant reçu un emailing ciblé">
            <input
              type="number"
              min={0}
              value={activeMonth.targetedEmailingCount}
              onChange={(e) => updateMonth("targetedEmailingCount", e.target.value)}
              className={inputCls}
              placeholder="0"
            />
          </Field>
          <Field label="Formulaires reçus avec cahier des charges correspondant">
            <input
              type="number"
              min={0}
              value={activeMonth.matchingFormsCount}
              onChange={(e) => updateMonth("matchingFormsCount", e.target.value)}
              className={inputCls}
              placeholder="0"
            />
          </Field>
          <Field label="Prospects ayant reçu la présentation commerciale">
            <input
              type="number"
              min={0}
              value={activeMonth.preselectionCount}
              onChange={(e) => updateMonth("preselectionCount", e.target.value)}
              className={inputCls}
              placeholder="0"
            />
          </Field>
        </div>

        <div className="mb-8 p-5 border border-primary-200 rounded-lg bg-white">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={activeMonth.brokersListingActive}
              onChange={(e) => updateMonth("brokersListingActive", e.target.checked)}
              className="w-5 h-5 accent-luxury-gold mt-0.5"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-luxury-charcoal">
                Mentionner l&apos;envoi hebdomadaire au listing brokers
              </span>
              <p className="text-xs text-luxury-slate mt-1">
                Affichera : « Votre espace a été envoyé tous les lundis à notre listing
                de X brokers immobiliers ».
              </p>
              {activeMonth.brokersListingActive && (
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-xs text-luxury-slate uppercase tracking-wider">
                    Nombre de brokers
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={activeMonth.brokersListingCount}
                    onChange={(e) => updateMonth("brokersListingCount", e.target.value)}
                    className="w-28 px-3 py-2 border border-primary-200 rounded focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              )}
            </div>
          </label>
        </div>

        <div className="mb-8">
          <BlockHeader
            label="Diffusion de l'annonce"
            hidden={isHidden("marketing.distribution")}
            onToggle={() => toggleSection("marketing.distribution")}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.entries(DISTRIBUTION_LABELS) as [keyof RapportDistribution, string][]).map(
              ([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors ${
                    activeMonth.distribution[key]
                      ? "border-luxury-gold bg-luxury-champagne/30"
                      : "border-primary-200 bg-white hover:border-primary-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={activeMonth.distribution[key]}
                    onChange={() => toggleDistribution(key)}
                    className="w-4 h-4 accent-luxury-gold"
                  />
                  <span className="text-sm text-luxury-charcoal">{label}</span>
                </label>
              )
            )}
          </div>
        </div>

        <Field
          label="Autres actions marketing (une par ligne)"
          full
          hidden={isHidden("marketing.other")}
          onToggle={() => toggleSection("marketing.other")}
        >
          <textarea
            value={activeMonth.otherMarketingActions}
            onChange={(e) => updateMonth("otherMarketingActions", e.target.value)}
            rows={4}
            className={inputCls + " resize-vertical"}
            placeholder={"ex:\nRefonte des visuels professionnels\nMise en avant Top Annonce sur Bureaux Locaux\nPost LinkedIn parrainé"}
          />
        </Field>

        <div className="mb-12" />

        <SectionTitle
          hidden={isHidden("prospection")}
          onToggle={() => toggleSection("prospection")}
        >
          Actions menées
        </SectionTitle>
        <Field label="Actions menées ce mois-ci (une par ligne)" full>
          <textarea
            value={activeMonth.prospectionActions}
            onChange={(e) => updateMonth("prospectionActions", e.target.value)}
            rows={5}
            className={inputCls + " resize-vertical"}
            placeholder={"ex:\nRelance des 28 prospects qualifiés du trimestre\nPrise de contact avec 12 brokers spécialistes du 4e arrondissement\nQualification de 18 nouveaux leads entrants"}
          />
        </Field>

        <div className="mb-12" />

        <SectionTitle
          hidden={isHidden("actions-a-venir")}
          onToggle={() => toggleSection("actions-a-venir")}
        >
          Actions à venir
        </SectionTitle>
        <Field label="Actions prévues le mois prochain (une par ligne)" full>
          <textarea
            value={activeMonth.upcomingActions}
            onChange={(e) => updateMonth("upcomingActions", e.target.value)}
            rows={5}
            className={inputCls + " resize-vertical"}
            placeholder={"ex:\nOrganiser un petit-déjeuner décideurs RH\nLancer une campagne LinkedIn sponsorisée\nRelancer les 4 propositions toujours en réflexion"}
          />
        </Field>

        <div className="mb-12" />

        <div className="flex items-center justify-between mb-6 pb-3 border-b border-primary-200">
          <h2 className="font-serif text-2xl text-luxury-charcoal">
            Comptes rendus de visite
          </h2>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => updateMonth("visites", [...activeMonth.visites, emptyVisite()])}
              className="text-sm text-luxury-gold hover:text-luxury-charcoal transition-colors"
            >
              + Ajouter une visite
            </button>
            <VisibilitySwitch
              hidden={isHidden("visites")}
              onToggle={() => toggleSection("visites")}
            />
          </div>
        </div>
        <div className="mb-6 p-5 border border-primary-200 rounded-lg bg-white">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.anonymizeVisitProspects}
              onChange={(e) => updateField("anonymizeVisitProspects", e.target.checked)}
              className="w-5 h-5 accent-luxury-gold mt-0.5"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-luxury-charcoal">
                Anonymiser le nom des prospects sur les visites
              </span>
              <p className="text-xs text-luxury-slate mt-1">
                Les noms seront masqués dans le rapport (« Prospect 1 », « Prospect 2 »…).
                Vous pouvez tout de même les saisir ci-dessous pour votre suivi interne.
              </p>
            </div>
          </label>
        </div>
        <div className="space-y-4 mb-12">
          {activeMonth.visites.map((v) => (
            <div key={v.id} className="p-5 border border-primary-200 rounded-lg bg-white">
              {v.status === "pending" && (
                <p className="mb-3 inline-block text-[11px] uppercase tracking-wider text-luxury-gold bg-luxury-champagne/40 px-2 py-1 rounded">
                  Proposition Gemini — à valider dans « Visites à valider »
                </p>
              )}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <Field small label="Date">
                  <input
                    type="date"
                    value={v.date}
                    onChange={(e) => updateVisite(v.id, { date: e.target.value })}
                    className={inputClsSmall}
                  />
                </Field>
                <Field small label="Prospect">
                  <input
                    type="text"
                    value={v.prospect}
                    onChange={(e) => updateVisite(v.id, { prospect: e.target.value })}
                    className={inputClsSmall}
                    placeholder="ex: Atelier Norée"
                  />
                </Field>
                <Field small label="Activité">
                  <input
                    type="text"
                    value={v.activity}
                    onChange={(e) => updateVisite(v.id, { activity: e.target.value })}
                    className={inputClsSmall}
                    placeholder="ex: Studio d'architecture"
                  />
                </Field>
                <Field small label="Postes envisagés">
                  <input
                    type="text"
                    value={v.workstations}
                    onChange={(e) => updateVisite(v.id, { workstations: e.target.value })}
                    className={inputClsSmall}
                    placeholder="ex: 12"
                  />
                </Field>
                <Field small label="Suite donnée" colSpan={2}>
                  <input
                    type="text"
                    value={v.outcome}
                    onChange={(e) => updateVisite(v.id, { outcome: e.target.value })}
                    className={inputClsSmall}
                    placeholder="ex: Proposition envoyée, relance prévue le 5/06"
                  />
                </Field>
              </div>
              <Field small label="Feedback / verbatims">
                <textarea
                  value={v.feedback}
                  onChange={(e) => updateVisite(v.id, { feedback: e.target.value })}
                  rows={3}
                  className={inputClsSmall + " resize-vertical"}
                  placeholder="Retours et objections du prospect."
                />
              </Field>
              {activeMonth.visites.length > 1 && (
                <div className="mt-3 text-right">
                  <button
                    type="button"
                    onClick={() => removeVisite(v.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Supprimer cette visite
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <SectionTitle
          hidden={isHidden("preconisations")}
          onToggle={() => toggleSection("preconisations")}
        >
          Nos préconisations
        </SectionTitle>
        <Field label="Préconisations (une par ligne)" full>
          <textarea
            value={form.recommendations}
            onChange={(e) => updateField("recommendations", e.target.value)}
            rows={5}
            className={inputCls + " resize-vertical"}
            placeholder={"ex:\nAjuster le loyer à la hausse au regard de la tension du quartier\nProduire une vidéo immersive pour différencier l'annonce\nOuvrir l'espace à la location à la journée pour générer des opportunités"}
          />
        </Field>

        <div className="mb-12" />

        <div className="flex items-center justify-between mb-6 pb-3 border-b border-primary-200">
          <h2 className="font-serif text-2xl text-luxury-charcoal">
            Espaces similaires sur le marché
          </h2>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() =>
                updateField("similarEspaces", [...form.similarEspaces, emptySimilar()])
              }
              className="text-sm text-luxury-gold hover:text-luxury-charcoal transition-colors"
            >
              + Ajouter un espace
            </button>
            <VisibilitySwitch
              hidden={isHidden("similaires")}
              onToggle={() => toggleSection("similaires")}
            />
          </div>
        </div>
        <div className="space-y-4 mb-12">
          {form.similarEspaces.map((s) => (
            <div key={s.id} className="p-5 border border-primary-200 rounded-lg bg-white">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Field small label="Nom de l'espace">
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) => updateSimilar(s.id, { name: e.target.value })}
                    className={inputClsSmall}
                    placeholder="ex: Le Sentier — Atelier"
                  />
                </Field>
                <Field small label="Lien (URL)">
                  <input
                    type="url"
                    value={s.url}
                    onChange={(e) => updateSimilar(s.id, { url: e.target.value })}
                    className={inputClsSmall}
                    placeholder="https://..."
                  />
                </Field>
                <Field small label="Nombre de postes">
                  <input
                    type="text"
                    value={s.workstations}
                    onChange={(e) => updateSimilar(s.id, { workstations: e.target.value })}
                    className={inputClsSmall}
                    placeholder="ex: 40"
                  />
                </Field>
                <Field small label="Loyer">
                  <input
                    type="text"
                    value={s.price}
                    onChange={(e) => updateSimilar(s.id, { price: e.target.value })}
                    className={inputClsSmall}
                    placeholder="ex: 17 000€ HT/mois"
                  />
                </Field>
                <Field small label="Image (URL)" colSpan={2}>
                  <input
                    type="url"
                    value={s.image}
                    onChange={(e) => updateSimilar(s.id, { image: e.target.value })}
                    className={inputClsSmall}
                    placeholder="https://..."
                  />
                </Field>
              </div>
              <Field small label="Description">
                <textarea
                  value={s.description}
                  onChange={(e) => updateSimilar(s.id, { description: e.target.value })}
                  rows={2}
                  className={inputClsSmall + " resize-vertical"}
                  placeholder="Quelques mots pour situer l'espace."
                />
              </Field>
              {form.similarEspaces.length > 1 && (
                <div className="mt-3 text-right">
                  <button
                    type="button"
                    onClick={() => removeSimilar(s.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Supprimer cet espace
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center pt-8 border-t border-primary-200">
          <button
            type="submit"
            disabled={isSaving}
            className={`luxury-btn text-base px-12 py-5 ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSaving
              ? mode === "edit"
                ? "Mise à jour..."
                : "Création..."
              : mode === "edit"
                ? "Mettre à jour le rapport"
                : "Créer le rapport"}
          </button>
        </div>
      </form>
    </main>
  );
}

const inputCls =
  "w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors";
const inputClsSmall =
  "w-full px-3 py-2 border border-primary-200 rounded focus:outline-none focus:border-luxury-gold transition-colors";

/**
 * Petit interrupteur affiché/masqué. Allumé (or) = bloc affiché dans le rapport,
 * éteint (gris) = bloc masqué.
 */
function VisibilitySwitch({
  hidden,
  onToggle,
}: {
  hidden: boolean;
  onToggle: () => void;
}) {
  return (
    <span className="flex items-center gap-2 shrink-0">
      <span
        className={`text-[11px] uppercase tracking-wider ${
          hidden ? "text-luxury-slate/60" : "text-luxury-gold"
        }`}
      >
        {hidden ? "Masqué" : "Affiché"}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={!hidden}
        onClick={onToggle}
        title={hidden ? "Masqué — cliquer pour afficher" : "Affiché — cliquer pour masquer"}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          hidden ? "bg-primary-200" : "bg-luxury-gold"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            hidden ? "translate-x-1" : "translate-x-6"
          }`}
        />
      </button>
    </span>
  );
}

function SectionTitle({
  children,
  hidden,
  onToggle,
}: {
  children: React.ReactNode;
  hidden?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-primary-200">
      <h2 className="font-serif text-2xl text-luxury-charcoal">{children}</h2>
      {onToggle && <VisibilitySwitch hidden={!!hidden} onToggle={onToggle} />}
    </div>
  );
}

/** En-tête d'un sous-bloc (à l'intérieur d'une section) avec interrupteur de visibilité. */
function BlockHeader({
  label,
  hidden,
  onToggle,
}: {
  label: string;
  hidden: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-3">
      <p className="text-sm font-medium text-luxury-charcoal">{label}</p>
      <VisibilitySwitch hidden={hidden} onToggle={onToggle} />
    </div>
  );
}

function Field({
  label,
  children,
  full,
  small,
  colSpan,
  hidden,
  onToggle,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  small?: boolean;
  colSpan?: number;
  hidden?: boolean;
  onToggle?: () => void;
}) {
  const className = [
    full ? "md:col-span-2" : "",
    colSpan === 2 ? "md:col-span-2" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4 mb-2">
        <label
          className={`block ${
            small ? "text-xs uppercase tracking-wider text-luxury-slate" : "text-sm font-medium text-luxury-charcoal"
          }`}
        >
          {label}
        </label>
        {onToggle && <VisibilitySwitch hidden={!!hidden} onToggle={onToggle} />}
      </div>
      {children}
    </div>
  );
}
