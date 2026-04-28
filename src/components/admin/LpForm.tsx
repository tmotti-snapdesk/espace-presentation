"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { LandingPageData, LpMissionCard, LpLogo, LpProcessStep, LpFaqItem, LpTestimonialItem } from "@/types/lp";
import Image from "next/image";
import AssetPicker from "@/components/admin/AssetPicker";

interface LpFormProps {
  mode: "create" | "edit";
  initialData?: LandingPageData;
}

const DEFAULT_CARDS: LpMissionCard[] = [
  { icon: "⭐", title: "Contrat flexible", text: "Un engagement adapté à la croissance de votre entreprise." },
  { icon: "👑", title: "100% chez vous", text: "Nous ne sommes pas un coworking, une seule entreprise par espace." },
  { icon: "🛎️", title: "Comme à l'hôtel", text: "Nous gérons les soucis du quotidien liés à votre bureau." },
  { icon: "💛", title: "Tout est inclus", text: "Taxe bureaux, taxe foncière, charges, EDF, entretien et réparations." },
];

export default function LpForm({ mode, initialData }: LpFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<"hero" | "logo" | "mission-photo" | null>(null);
  const [iconPickerIndex, setIconPickerIndex] = useState<number | null>(null);
  const [testimonialPhotoPickerIndex, setTestimonialPhotoPickerIndex] = useState<number | null>(null);
  const [urgencyIconPickerIndex, setUrgencyIconPickerIndex] = useState<number | null>(null);
  const [uploadingIconIndex, setUploadingIconIndex] = useState<number | null>(null);
  const [uploadingTestimonialPhotoIndex, setUploadingTestimonialPhotoIndex] = useState<number | null>(null);
  const [uploadingUrgencyIconIndex, setUploadingUrgencyIconIndex] = useState<number | null>(null);
  const [uploadingMissionPhoto, setUploadingMissionPhoto] = useState(false);

  // ── Hero ──
  const [form, setForm] = useState({
    slug: initialData?.slug || "",
    internalTitle: initialData?.internalTitle || "",
    heroTitle: initialData?.heroTitle || "",
    heroSubtitle: initialData?.heroSubtitle || "",
    heroCtaText: initialData?.heroCtaText || "En savoir plus",
    heroVideoUrl: initialData?.heroVideoUrl || "",
  });

  // ── Notre métier ──
  const [missionLabel, setMissionLabel] = useState(initialData?.missionLabel || "");
  const [missionTitle, setMissionTitle] = useState(initialData?.missionTitle || "");
  const [missionSubtitle, setMissionSubtitle] = useState(initialData?.missionSubtitle || "");
  const [missionCards, setMissionCards] = useState<LpMissionCard[]>(
    initialData?.missionCards || DEFAULT_CARDS
  );
  const [missionPhotos, setMissionPhotos] = useState<string[]>(initialData?.missionPhotos || []);

  // ── Process / Comment ça marche ──
  const [processLabel, setProcessLabel] = useState(initialData?.processLabel || "");
  const [processTitle, setProcessTitle] = useState(initialData?.processTitle || "");
  const [processSubtitle, setProcessSubtitle] = useState(initialData?.processSubtitle || "");
  const [processSteps, setProcessSteps] = useState<LpProcessStep[]>(
    initialData?.processSteps || []
  );

  // ── Urgency (steps + countdown) ──
  const [urgencyLabel, setUrgencyLabel] = useState(initialData?.urgencyLabel || "");
  const [urgencyTitle, setUrgencyTitle] = useState(initialData?.urgencyTitle || "");
  const [urgencySubtitle, setUrgencySubtitle] = useState(initialData?.urgencySubtitle || "");
  const [urgencySteps, setUrgencySteps] = useState<LpProcessStep[]>(
    initialData?.urgencySteps || []
  );
  // The form binds to the local "YYYY-MM-DDTHH:mm" representation expected by
  // <input type="datetime-local">; we serialise to a full ISO string on submit.
  const [urgencyDeadline, setUrgencyDeadline] = useState(
    initialData?.urgencyDeadline ? toLocalDatetimeInput(initialData.urgencyDeadline) : ""
  );
  const [urgencyExpiredText, setUrgencyExpiredText] = useState(initialData?.urgencyExpiredText || "");

  // ── Social proof ──
  const [socialProofTitle, setSocialProofTitle] = useState(initialData?.socialProofTitle || "");
  const [socialProofLogos, setSocialProofLogos] = useState<LpLogo[]>(
    initialData?.socialProofLogos || []
  );
  const [socialProofShowGoogleRating, setSocialProofShowGoogleRating] = useState<boolean>(
    Boolean(initialData?.socialProofShowGoogleRating)
  );

  // ── FAQ ──
  const [faqLabel, setFaqLabel] = useState(initialData?.faqLabel || "");
  const [faqTitle, setFaqTitle] = useState(initialData?.faqTitle || "");
  const [faqSubtitle, setFaqSubtitle] = useState(initialData?.faqSubtitle || "");
  const [faqItems, setFaqItems] = useState<LpFaqItem[]>(initialData?.faqItems || []);

  // ── Témoignages clients (un seul ou plusieurs en mode slider) ──
  // Hydrate from the new array first; fall back to the legacy single-item
  // fields so previously-saved LPs migrate transparently on first edit.
  const [testimonials, setTestimonials] = useState<LpTestimonialItem[]>(() => {
    if (initialData?.testimonials && initialData.testimonials.length > 0) {
      return initialData.testimonials;
    }
    if (initialData?.testimonialQuote) {
      return [{
        quote: initialData.testimonialQuote,
        authorName: initialData.testimonialAuthorName,
        authorCompany: initialData.testimonialAuthorCompany,
        authorRole: initialData.testimonialAuthorRole,
        authorPhoto: initialData.testimonialAuthorPhoto,
      }];
    }
    return [];
  });

  // ── Formulaire ──
  const [formTitle, setFormTitle] = useState(initialData?.formTitle || "");
  const [formLabel, setFormLabel] = useState(initialData?.formLabel || "");
  const [formCtaText, setFormCtaText] = useState(initialData?.formCtaText || "Envoyer ma demande");
  const [formHubspotFormId, setFormHubspotFormId] = useState(initialData?.formHubspotFormId || "");

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  // Build a unique Blob pathname so repeated uploads with identical
  // filenames don't collide (Blob refuses overwrite by default).
  const buildUploadPath = (kind: string, file: File) => {
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
    const lpSlug = form.slug || "new";
    return `lp/${lpSlug}/${kind}-${Date.now()}-${sanitized}`;
  };

  // ── Video upload ──
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const blob = await upload(buildUploadPath("hero", file), file, { access: "public", handleUploadUrl: "/api/upload" });
      setForm((f) => ({ ...f, heroVideoUrl: blob.url }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Erreur lors de l'upload de la vidéo : ${msg}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  // ── Logo upload ──
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const blob = await upload(buildUploadPath("logo", file), file, { access: "public", handleUploadUrl: "/api/upload" });
      setSocialProofLogos((prev) => [...prev, { url: blob.url, alt: file.name.replace(/\.[^.]+$/, "") }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Erreur lors de l'upload du logo : ${msg}`);
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  // ── Mission carousel photos upload ──
  const handleMissionPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMissionPhoto(true);
    try {
      const blob = await upload(buildUploadPath("mission", file), file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setMissionPhotos((prev) => [...prev, blob.url]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Erreur lors de l'upload de la photo : ${msg}`);
    } finally {
      setUploadingMissionPhoto(false);
      e.target.value = "";
    }
  };

  const moveMissionPhoto = (i: number, dir: -1 | 1) =>
    setMissionPhotos((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  // ── Testimonial helpers ──
  const updateTestimonial = (i: number, field: keyof LpTestimonialItem, value: string) =>
    setTestimonials((prev) => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  const addTestimonial = () =>
    setTestimonials((prev) => [...prev, { quote: "" }]);
  const removeTestimonial = (i: number) =>
    setTestimonials((prev) => prev.filter((_, idx) => idx !== i));
  const moveTestimonial = (i: number, dir: -1 | 1) =>
    setTestimonials((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const handleTestimonialPhotoUpload = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTestimonialPhotoIndex(i);
    try {
      const blob = await upload(buildUploadPath(`testimonial-${i}`, file), file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      updateTestimonial(i, "authorPhoto", blob.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Erreur lors de l'upload de la photo : ${msg}`);
    } finally {
      setUploadingTestimonialPhotoIndex(null);
      e.target.value = "";
    }
  };

  // ── Mission cards helpers ──
  const updateCard = (i: number, field: keyof LpMissionCard, value: string) =>
    setMissionCards((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  const addCard = () =>
    setMissionCards((prev) => [...prev, { icon: "✨", title: "", text: "" }]);
  const removeCard = (i: number) =>
    setMissionCards((prev) => prev.filter((_, idx) => idx !== i));

  const handleCardIconUpload = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIconIndex(i);
    try {
      const blob = await upload(buildUploadPath(`icon-${i}`, file), file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      updateCard(i, "iconImage", blob.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Erreur lors de l'upload du picto : ${msg}`);
    } finally {
      setUploadingIconIndex(null);
      e.target.value = "";
    }
  };

  // ── Process steps helpers ──
  const updateStep = (i: number, field: keyof LpProcessStep, value: string) =>
    setProcessSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  const addStep = () =>
    setProcessSteps((prev) => [...prev, { title: "", text: "" }]);
  const removeStep = (i: number) =>
    setProcessSteps((prev) => prev.filter((_, idx) => idx !== i));

  // ── Urgency steps helpers ──
  const updateUrgencyStep = (i: number, field: keyof LpProcessStep, value: string) =>
    setUrgencySteps((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  const addUrgencyStep = () =>
    setUrgencySteps((prev) => [...prev, { title: "", text: "" }]);
  const removeUrgencyStep = (i: number) =>
    setUrgencySteps((prev) => prev.filter((_, idx) => idx !== i));

  const handleUrgencyStepIconUpload = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingUrgencyIconIndex(i);
    try {
      const blob = await upload(buildUploadPath(`urgency-icon-${i}`, file), file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      updateUrgencyStep(i, "iconImage", blob.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Erreur lors de l'upload du picto : ${msg}`);
    } finally {
      setUploadingUrgencyIconIndex(null);
      e.target.value = "";
    }
  };

  // ── FAQ helpers ──
  const updateFaqItem = (i: number, field: keyof LpFaqItem, value: string) =>
    setFaqItems((prev) => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  const addFaqItem = () =>
    setFaqItems((prev) => [...prev, { question: "", answer: "" }]);
  const removeFaqItem = (i: number) =>
    setFaqItems((prev) => prev.filter((_, idx) => idx !== i));

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug) { setError("Le slug est requis."); return; }
    setIsSaving(true);
    setError(null);

    const payload: Partial<LandingPageData> = {
      ...form,
      missionLabel: missionLabel || undefined,
      missionTitle: missionTitle || undefined,
      missionSubtitle: missionSubtitle || undefined,
      missionCards: missionCards.filter((c) => c.title),
      missionPhotos: missionPhotos.length > 0 ? missionPhotos : undefined,
      processLabel: processLabel || undefined,
      processTitle: processTitle || undefined,
      processSubtitle: processSubtitle || undefined,
      processSteps: processSteps.filter((s) => s.title || s.text),
      urgencyLabel: urgencyLabel || undefined,
      urgencyTitle: urgencyTitle || undefined,
      urgencySubtitle: urgencySubtitle || undefined,
      urgencySteps: urgencySteps.filter((s) => s.title || s.text),
      urgencyDeadline: urgencyDeadline ? new Date(urgencyDeadline).toISOString() : undefined,
      urgencyExpiredText: urgencyExpiredText || undefined,
      socialProofTitle: socialProofTitle || undefined,
      socialProofLogos: socialProofLogos.length > 0 ? socialProofLogos : undefined,
      socialProofShowGoogleRating: socialProofShowGoogleRating || undefined,
      testimonials: (() => {
        const cleaned = testimonials
          .filter((t) => t.quote && t.quote.trim())
          .map((t) => ({
            quote: t.quote.trim(),
            authorName: t.authorName || undefined,
            authorCompany: t.authorCompany || undefined,
            authorRole: t.authorRole || undefined,
            authorPhoto: t.authorPhoto || undefined,
          }));
        return cleaned.length > 0 ? cleaned : undefined;
      })(),
      // Drop the legacy single-testimonial fields so they don't shadow the new
      // `testimonials` array on subsequent reads.
      testimonialQuote: undefined,
      testimonialAuthorName: undefined,
      testimonialAuthorCompany: undefined,
      testimonialAuthorRole: undefined,
      testimonialAuthorPhoto: undefined,
      faqLabel: faqLabel || undefined,
      faqTitle: faqTitle || undefined,
      faqSubtitle: faqSubtitle || undefined,
      faqItems: faqItems.filter((it) => it.question),
      formTitle: formTitle || undefined,
      formLabel: formLabel || undefined,
      formCtaText: formCtaText || undefined,
      formHubspotFormId: formHubspotFormId || undefined,
    };

    try {
      let res: Response;
      if (mode === "create") {
        res = await fetch("/api/lp/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/lp/${initialData!.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...initialData, ...payload }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur inconnue");
      }

      const data = await res.json();
      setSavedUrl(`/lp/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm bg-white";
  const labelClass = "block text-xs uppercase tracking-[0.15em] text-luxury-slate mb-2 font-medium";

  if (savedUrl) {
    return (
      <main className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h2 className="font-serif text-2xl text-luxury-charcoal mb-4">
            {mode === "create" ? "LP créée !" : "LP mise à jour !"}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            <a href={savedUrl} target="_blank" rel="noopener noreferrer" className="luxury-btn">Voir la LP</a>
            <a href="/admin/lp" className="luxury-btn-outline">Retour au dashboard</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-luxury-cream">
      <div className="bg-luxury-charcoal text-white py-8 px-6 md:px-12">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="luxury-label text-luxury-gold mb-1">Snapdesk</p>
            <h1 className="font-serif text-2xl">
              {mode === "create" ? "Nouvelle Landing Page" : "Modifier la LP"}
            </h1>
          </div>
          <a href="/admin/lp" className="text-white/60 text-sm hover:text-white transition-colors">← Retour</a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-12 px-6 md:px-12">
        <form onSubmit={handleSubmit} className="space-y-14">

          {/* ── Identité ── */}
          <section>
            <SectionTitle>Identité</SectionTitle>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Titre interne (admin uniquement)</label>
                <input type="text" value={form.internalTitle} onChange={set("internalTitle")}
                  className={inputClass} placeholder="Campagne Office Manager Q2 2026" required />
              </div>
              <div>
                <label className={labelClass}>
                  Slug URL{mode === "edit" && <span className="text-luxury-slate/60 normal-case tracking-normal"> (non modifiable)</span>}
                </label>
                <div className="flex items-center border border-primary-200 focus-within:border-luxury-gold transition-colors bg-white">
                  <span className="px-4 py-3 text-sm text-luxury-slate/60 border-r border-primary-200 shrink-0">/lp/</span>
                  <input type="text" value={form.slug} onChange={set("slug")}
                    className="flex-1 px-4 py-3 text-sm focus:outline-none"
                    placeholder="campagne-office-manager" required
                    disabled={mode === "edit"}
                    pattern="[a-z0-9-]+" title="Minuscules, chiffres et tirets uniquement" />
                </div>
              </div>
            </div>
          </section>

          {/* ── Hero ── */}
          <section>
            <SectionTitle>Hero</SectionTitle>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Vidéo de fond</label>
                {form.heroVideoUrl && (
                  <div className="mb-3 flex items-center gap-3 p-3 bg-primary-50 border border-primary-100 text-xs text-luxury-slate">
                    <span className="truncate flex-1">{form.heroVideoUrl}</span>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, heroVideoUrl: "" }))}
                      className="shrink-0 text-red-400 hover:text-red-600">Retirer</button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input type="file" accept="video/mp4,video/quicktime" onChange={handleVideoChange}
                    className="flex-1 text-sm text-luxury-slate file:mr-4 file:py-2 file:px-4 file:border file:border-primary-200 file:text-xs file:uppercase file:tracking-wider file:bg-white file:text-luxury-charcoal hover:file:bg-primary-50 file:cursor-pointer cursor-pointer" />
                  <button type="button" onClick={() => setPickerOpen("hero")}
                    className="shrink-0 px-4 py-2 text-xs uppercase tracking-wider border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors">
                    Bibliothèque
                  </button>
                </div>
                {uploadingVideo && <p className="text-xs text-luxury-slate mt-2">Upload en cours...</p>}
              </div>
              <div>
                <label className={labelClass}>Titre principal</label>
                <input type="text" value={form.heroTitle} onChange={set("heroTitle")}
                  className={inputClass} placeholder="Faites le plein de vitamines au bureau !" required />
              </div>
              <div>
                <label className={labelClass}>Sous-titre</label>
                <textarea value={form.heroSubtitle} onChange={set("heroSubtitle")}
                  className={inputClass} rows={3}
                  placeholder="Gagnez 1 mois de corbeilles de fruits frais livrées dans vos locaux..." />
              </div>
              <div>
                <label className={labelClass}>Texte du CTA</label>
                <input type="text" value={form.heroCtaText} onChange={set("heroCtaText")}
                  className={inputClass} placeholder="J'inscris mon équipe" required />
                <p className="text-xs text-luxury-slate/60 mt-1">Ancre automatiquement vers le formulaire.</p>
              </div>
            </div>
          </section>

          {/* ── Notre métier ── */}
          <section>
            <SectionTitle>Notre métier</SectionTitle>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Label (texte au-dessus du titre)</label>
                <input type="text" value={missionLabel} onChange={(e) => setMissionLabel(e.target.value)}
                  className={inputClass} placeholder="Snapdesk — des bureaux mais pas que..." />
              </div>
              <div>
                <label className={labelClass}>Titre de section</label>
                <input type="text" value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)}
                  className={inputClass} placeholder="Notre métier : le bureau 2.0" />
              </div>
              <div>
                <label className={labelClass}>Sous-titre</label>
                <input type="text" value={missionSubtitle} onChange={(e) => setMissionSubtitle(e.target.value)}
                  className={inputClass} placeholder="Des bureaux canons, c'est super. Des bureaux clés en main, full services, c'est encore mieux." />
              </div>

              {/* Cards */}
              <div>
                <label className={labelClass}>Cards bénéfices</label>
                <div className="space-y-4">
                  {missionCards.map((card, i) => (
                    <div key={i} className="border border-primary-100 p-3 bg-white">
                      <div className="grid grid-cols-[1fr_1fr_32px] gap-2 items-start">
                        <input type="text" value={card.title}
                          onChange={(e) => updateCard(i, "title", e.target.value)}
                          className={inputClass} placeholder="Titre de la card" />
                        <input type="text" value={card.text}
                          onChange={(e) => updateCard(i, "text", e.target.value)}
                          className={inputClass} placeholder="Description courte" />
                        <button type="button" onClick={() => removeCard(i)}
                          className="mt-3 text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        {card.iconImage ? (
                          <div className="flex items-center gap-2">
                            <div className="relative h-10 w-10 border border-primary-100 bg-white">
                              <Image src={card.iconImage} alt="" fill className="object-contain p-1" sizes="40px" />
                            </div>
                            <button type="button"
                              onClick={() => updateCard(i, "iconImage", "")}
                              className="text-xs text-red-400 hover:text-red-600">Retirer le picto</button>
                          </div>
                        ) : (
                          <input type="text" value={card.icon}
                            onChange={(e) => updateCard(i, "icon", e.target.value)}
                            className="w-14 px-2 py-2 border border-primary-200 text-center text-xl bg-white focus:outline-none focus:border-luxury-gold"
                            placeholder="⭐" title="Emoji de secours" />
                        )}
                        <label className="shrink-0 px-3 py-2 text-xs uppercase tracking-wider border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors cursor-pointer">
                          {card.iconImage ? "Remplacer" : "Importer un picto"}
                          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={(e) => handleCardIconUpload(i, e)} className="hidden" />
                        </label>
                        <button type="button" onClick={() => setIconPickerIndex(i)}
                          className="shrink-0 px-3 py-2 text-xs uppercase tracking-wider border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors">
                          Bibliothèque
                        </button>
                        {uploadingIconIndex === i && (
                          <span className="text-xs text-luxury-slate">Upload en cours...</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addCard}
                  className="mt-3 text-sm text-luxury-gold hover:text-luxury-charcoal transition-colors">
                  + Ajouter une card
                </button>
                <p className="text-xs text-luxury-slate/60 mt-2">
                  Utilisez un emoji ou importez un picto Snapdesk (PNG/SVG transparent recommandé).
                </p>
              </div>

              <div>
                <label className={labelClass}>Carrousel de photos (optionnel)</label>
                <p className="text-xs text-luxury-slate/70 mb-3">
                  Affiche un petit carrousel à droite des cards (autoplay, ~4s par photo). Format carré recommandé. Ne s&apos;affiche pas si aucune photo n&apos;est ajoutée.
                </p>
                {missionPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {missionPhotos.map((url, i) => (
                      <div key={i} className="relative group">
                        <div className="relative h-20 w-20 border border-primary-100 bg-white">
                          <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => moveMissionPhoto(i, -1)}
                            disabled={i === 0}
                            aria-label="Reculer"
                            className="w-5 h-5 rounded-full bg-luxury-charcoal text-white text-[10px] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed">‹</button>
                          <button type="button" onClick={() => moveMissionPhoto(i, 1)}
                            disabled={i === missionPhotos.length - 1}
                            aria-label="Avancer"
                            className="w-5 h-5 rounded-full bg-luxury-charcoal text-white text-[10px] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed">›</button>
                          <button type="button"
                            onClick={() => setMissionPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                            aria-label="Supprimer"
                            className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/png,image/jpeg,image/webp"
                    onChange={handleMissionPhotoUpload}
                    className="flex-1 text-sm text-luxury-slate file:mr-4 file:py-2 file:px-4 file:border file:border-primary-200 file:text-xs file:uppercase file:tracking-wider file:bg-white file:text-luxury-charcoal hover:file:bg-primary-50 file:cursor-pointer cursor-pointer" />
                  <button type="button" onClick={() => setPickerOpen("mission-photo")}
                    className="shrink-0 px-4 py-2 text-xs uppercase tracking-wider border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors">
                    Bibliothèque
                  </button>
                </div>
                {uploadingMissionPhoto && <p className="text-xs text-luxury-slate mt-2">Upload en cours...</p>}
              </div>
            </div>
          </section>

          {/* ── Process / Comment ça marche ── */}
          <section>
            <SectionTitle>Comment ça marche (optionnel)</SectionTitle>
            <p className="text-xs text-luxury-slate/70 mb-5 -mt-2">
              Section facultative présentant le déroulé de la campagne en étapes numérotées. Elle ne s&apos;affiche que si au moins un champ est renseigné.
            </p>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Label (texte au-dessus du titre)</label>
                <input type="text" value={processLabel} onChange={(e) => setProcessLabel(e.target.value)}
                  className={inputClass} placeholder="Le déroulé" />
              </div>
              <div>
                <label className={labelClass}>Titre de section</label>
                <input type="text" value={processTitle} onChange={(e) => setProcessTitle(e.target.value)}
                  className={inputClass} placeholder="Comment ça marche ?" />
              </div>
              <div>
                <label className={labelClass}>Sous-titre</label>
                <textarea value={processSubtitle} onChange={(e) => setProcessSubtitle(e.target.value)}
                  className={inputClass} rows={2}
                  placeholder="Une campagne pensée pour vous faciliter la vie, de l'inscription à la livraison." />
              </div>

              <div>
                <label className={labelClass}>Étapes</label>
                <div className="space-y-3">
                  {processSteps.map((step, i) => (
                    <div key={i} className="grid grid-cols-[40px_1fr_2fr_32px] gap-2 items-start">
                      <div className="mt-3 text-center font-serif text-2xl text-luxury-gold italic">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <input type="text" value={step.title}
                        onChange={(e) => updateStep(i, "title", e.target.value)}
                        className={inputClass} placeholder="Titre de l'étape" />
                      <input type="text" value={step.text}
                        onChange={(e) => updateStep(i, "text", e.target.value)}
                        className={inputClass} placeholder="Description de l'étape" />
                      <button type="button" onClick={() => removeStep(i)}
                        className="mt-3 text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addStep}
                  className="mt-3 text-sm text-luxury-gold hover:text-luxury-charcoal transition-colors">
                  + Ajouter une étape
                </button>
              </div>
            </div>
          </section>

          {/* ── Urgence (étapes + compte à rebours) ── */}
          <section>
            <SectionTitle>Urgence + compte à rebours (optionnel)</SectionTitle>
            <p className="text-xs text-luxury-slate/70 mb-5 -mt-2">
              Bloc affiché juste avant le formulaire pour créer de l&apos;urgence : étapes courtes à gauche, compteur jusqu&apos;à une date à droite. Ne s&apos;affiche que si au moins un champ est renseigné.
            </p>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Label (texte au-dessus du titre)</label>
                <input type="text" value={urgencyLabel} onChange={(e) => setUrgencyLabel(e.target.value)}
                  className={inputClass} placeholder="Offre limitée" />
              </div>
              <div>
                <label className={labelClass}>Titre de section</label>
                <input type="text" value={urgencyTitle} onChange={(e) => setUrgencyTitle(e.target.value)}
                  className={inputClass} placeholder="Ne laissez pas passer cette opportunité" />
              </div>
              <div>
                <label className={labelClass}>Sous-titre</label>
                <textarea value={urgencySubtitle} onChange={(e) => setUrgencySubtitle(e.target.value)}
                  className={inputClass} rows={2}
                  placeholder="Inscrivez votre équipe avant la fin de l'offre pour profiter du tarif." />
              </div>

              <div>
                <label className={labelClass}>Étapes (2 ou 3 recommandées)</label>
                <p className="text-xs text-luxury-slate/70 -mt-1 mb-3">
                  Numérotation par défaut. Importez un picto par étape pour remplacer le numéro (ex. fruits, icônes thématiques).
                </p>
                <div className="space-y-3">
                  {urgencySteps.map((step, i) => (
                    <div key={i} className="border border-primary-100 p-3 bg-white">
                      <div className="grid grid-cols-[48px_1fr_2fr_32px] gap-2 items-start">
                        <div className="mt-2 flex items-center justify-center">
                          {step.iconImage ? (
                            <div className="relative h-10 w-10">
                              <Image src={step.iconImage} alt="" fill className="object-contain" sizes="40px" />
                            </div>
                          ) : (
                            <div className="text-center font-serif text-2xl text-luxury-gold italic">
                              {String(i + 1).padStart(2, "0")}
                            </div>
                          )}
                        </div>
                        <input type="text" value={step.title}
                          onChange={(e) => updateUrgencyStep(i, "title", e.target.value)}
                          className={inputClass} placeholder="Titre de l'étape" />
                        <input type="text" value={step.text}
                          onChange={(e) => updateUrgencyStep(i, "text", e.target.value)}
                          className={inputClass} placeholder="Description de l'étape" />
                        <button type="button" onClick={() => removeUrgencyStep(i)}
                          className="mt-3 text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <label className="shrink-0 px-3 py-2 text-xs uppercase tracking-wider border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors cursor-pointer">
                          {step.iconImage ? "Remplacer le picto" : "Importer un picto"}
                          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={(e) => handleUrgencyStepIconUpload(i, e)} className="hidden" />
                        </label>
                        <button type="button" onClick={() => setUrgencyIconPickerIndex(i)}
                          className="shrink-0 px-3 py-2 text-xs uppercase tracking-wider border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors">
                          Bibliothèque
                        </button>
                        {step.iconImage && (
                          <button type="button" onClick={() => updateUrgencyStep(i, "iconImage", "")}
                            className="text-xs text-red-400 hover:text-red-600">Retirer le picto</button>
                        )}
                        {uploadingUrgencyIconIndex === i && (
                          <span className="text-xs text-luxury-slate">Upload en cours...</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addUrgencyStep}
                  className="mt-3 text-sm text-luxury-gold hover:text-luxury-charcoal transition-colors">
                  + Ajouter une étape
                </button>
              </div>

              <div>
                <label className={labelClass}>Date & heure de fin (compte à rebours)</label>
                <div className="flex items-center gap-3">
                  <input type="datetime-local" value={urgencyDeadline}
                    onChange={(e) => setUrgencyDeadline(e.target.value)}
                    className={inputClass} />
                  {urgencyDeadline && (
                    <button type="button" onClick={() => setUrgencyDeadline("")}
                      className="shrink-0 text-xs text-red-400 hover:text-red-600">Effacer</button>
                  )}
                </div>
                <p className="text-xs text-luxury-slate/60 mt-1">
                  Le compteur affiche jours / heures / minutes / secondes restants. Heure locale du visiteur convertie depuis cette date.
                </p>
              </div>

              <div>
                <label className={labelClass}>Message une fois la date dépassée (optionnel)</label>
                <input type="text" value={urgencyExpiredText} onChange={(e) => setUrgencyExpiredText(e.target.value)}
                  className={inputClass} placeholder="L'offre est terminée" />
              </div>
            </div>
          </section>

          {/* ── Social proof ── */}
          <section>
            <SectionTitle>Social proof</SectionTitle>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Titre / label (ex. "90+ entreprises nous font confiance")</label>
                <input type="text" value={socialProofTitle}
                  onChange={(e) => setSocialProofTitle(e.target.value)}
                  className={inputClass} placeholder="90+ entreprises nous font déjà confiance" />
              </div>
              <div>
                <label className="inline-flex items-start gap-3 cursor-pointer">
                  <input type="checkbox"
                    checked={socialProofShowGoogleRating}
                    onChange={(e) => setSocialProofShowGoogleRating(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-luxury-gold cursor-pointer" />
                  <span>
                    <span className="block text-sm text-luxury-charcoal">
                      Afficher la note <strong>4,8/5 Google</strong> avant les logos
                    </span>
                    <span className="block text-xs text-luxury-slate/70 mt-0.5">
                      Bloc épingle avec le logo Google et les étoiles, affiché au-dessus des logos clients.
                    </span>
                  </span>
                </label>
              </div>
              <div>
                <label className={labelClass}>Logos clients</label>
                {socialProofLogos.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {socialProofLogos.map((logo, i) => (
                      <div key={i} className="relative group">
                        <div className="relative h-10 w-24 border border-primary-100 bg-white p-1">
                          <Image src={logo.url} alt={logo.alt} fill className="object-contain" />
                        </div>
                        <button type="button"
                          onClick={() => setSocialProofLogos((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                    onChange={handleLogoUpload}
                    className="flex-1 text-sm text-luxury-slate file:mr-4 file:py-2 file:px-4 file:border file:border-primary-200 file:text-xs file:uppercase file:tracking-wider file:bg-white file:text-luxury-charcoal hover:file:bg-primary-50 file:cursor-pointer cursor-pointer" />
                  <button type="button" onClick={() => setPickerOpen("logo")}
                    className="shrink-0 px-4 py-2 text-xs uppercase tracking-wider border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors">
                    Bibliothèque
                  </button>
                </div>
                {uploadingLogo && <p className="text-xs text-luxury-slate mt-2">Upload en cours...</p>}
                <p className="text-xs text-luxury-slate/60 mt-1">Cliquez plusieurs fois pour ajouter plusieurs logos.</p>
              </div>
            </div>
          </section>

          {/* ── Témoignages clients ── */}
          <section>
            <SectionTitle>Témoignages clients (optionnel)</SectionTitle>
            <p className="text-xs text-luxury-slate/70 mb-5 -mt-2">
              Ajoutez un ou plusieurs témoignages. Au-delà du premier, ils défilent en mode slider (auto-rotation, flèches et bullets). Le nom, l&apos;entreprise et le poste sont facultatifs.
            </p>

            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={i} className="border border-primary-100 p-4 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.15em] text-luxury-slate/70">
                      Témoignage {i + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveTestimonial(i, -1)}
                        disabled={i === 0}
                        aria-label="Déplacer vers le haut"
                        className="w-7 h-7 border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">↑</button>
                      <button type="button" onClick={() => moveTestimonial(i, 1)}
                        disabled={i === testimonials.length - 1}
                        aria-label="Déplacer vers le bas"
                        className="w-7 h-7 border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">↓</button>
                      <button type="button" onClick={() => removeTestimonial(i)}
                        aria-label="Supprimer le témoignage"
                        className="w-7 h-7 border border-red-200 text-red-500 hover:bg-red-50 transition-colors">×</button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Citation</label>
                    <textarea value={t.quote}
                      onChange={(e) => updateTestimonial(i, "quote", e.target.value)}
                      className={inputClass} rows={4}
                      placeholder="Depuis qu'on a installé les équipes chez Snapdesk, on a gagné en sérénité au quotidien." />
                  </div>

                  <div>
                    <label className={labelClass}>Photo de l&apos;auteur (optionnel)</label>
                    <div className="flex items-center gap-4">
                      {t.authorPhoto ? (
                        <div className="relative h-16 w-16 rounded-full overflow-hidden border border-primary-200 shrink-0">
                          <Image src={t.authorPhoto} alt="" fill className="object-cover" sizes="64px" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-full border border-dashed border-primary-200 bg-primary-50 shrink-0" />
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="px-3 py-2 text-xs uppercase tracking-wider border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors cursor-pointer">
                          {t.authorPhoto ? "Remplacer" : "Importer"}
                          <input type="file" accept="image/png,image/jpeg,image/webp"
                            onChange={(e) => handleTestimonialPhotoUpload(i, e)} className="hidden" />
                        </label>
                        <button type="button" onClick={() => setTestimonialPhotoPickerIndex(i)}
                          className="px-3 py-2 text-xs uppercase tracking-wider border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors">
                          Bibliothèque
                        </button>
                        {t.authorPhoto && (
                          <button type="button" onClick={() => updateTestimonial(i, "authorPhoto", "")}
                            className="text-xs text-red-400 hover:text-red-600">Retirer</button>
                        )}
                        {uploadingTestimonialPhotoIndex === i && (
                          <span className="text-xs text-luxury-slate">Upload en cours...</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nom du client</label>
                      <input type="text" value={t.authorName || ""}
                        onChange={(e) => updateTestimonial(i, "authorName", e.target.value)}
                        className={inputClass} placeholder="Marie Dupont" />
                    </div>
                    <div>
                      <label className={labelClass}>Intitulé de poste</label>
                      <input type="text" value={t.authorRole || ""}
                        onChange={(e) => updateTestimonial(i, "authorRole", e.target.value)}
                        className={inputClass} placeholder="Office Manager" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Entreprise</label>
                    <input type="text" value={t.authorCompany || ""}
                      onChange={(e) => updateTestimonial(i, "authorCompany", e.target.value)}
                      className={inputClass} placeholder="Acme Corp" />
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={addTestimonial}
              className="mt-4 text-sm text-luxury-gold hover:text-luxury-charcoal transition-colors">
              + Ajouter un témoignage
            </button>
          </section>

          {/* ── FAQ ── */}
          <section>
            <SectionTitle>FAQ (optionnel)</SectionTitle>
            <p className="text-xs text-luxury-slate/70 mb-5 -mt-2">
              Section accordéon affichée juste avant le formulaire. Idéale pour répondre aux objections (engagement, délai, prix...). Masquée tant qu&apos;aucune question n&apos;est ajoutée.
            </p>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Label (texte au-dessus du titre)</label>
                <input type="text" value={faqLabel} onChange={(e) => setFaqLabel(e.target.value)}
                  className={inputClass} placeholder="Vos questions" />
              </div>
              <div>
                <label className={labelClass}>Titre de section</label>
                <input type="text" value={faqTitle} onChange={(e) => setFaqTitle(e.target.value)}
                  className={inputClass} placeholder="Vous vous demandez peut-être..." />
              </div>
              <div>
                <label className={labelClass}>Sous-titre</label>
                <textarea value={faqSubtitle} onChange={(e) => setFaqSubtitle(e.target.value)}
                  className={inputClass} rows={2}
                  placeholder="Tout ce qu'il faut savoir avant de vous lancer." />
              </div>

              <div>
                <label className={labelClass}>Questions / réponses</label>
                <div className="space-y-3">
                  {faqItems.map((item, i) => (
                    <div key={i} className="border border-primary-100 p-3 bg-white">
                      <div className="grid grid-cols-[1fr_32px] gap-2 items-start">
                        <input type="text" value={item.question}
                          onChange={(e) => updateFaqItem(i, "question", e.target.value)}
                          className={inputClass} placeholder="Question" />
                        <button type="button" onClick={() => removeFaqItem(i)}
                          className="mt-3 text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                      </div>
                      <textarea value={item.answer}
                        onChange={(e) => updateFaqItem(i, "answer", e.target.value)}
                        className={`${inputClass} mt-2`} rows={3} placeholder="Réponse" />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addFaqItem}
                  className="mt-3 text-sm text-luxury-gold hover:text-luxury-charcoal transition-colors">
                  + Ajouter une question
                </button>
              </div>
            </div>
          </section>

          {/* ── Formulaire ── */}
          <section>
            <SectionTitle>Formulaire</SectionTitle>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Titre du formulaire</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  className={inputClass} placeholder="30 secondes pour nous rejoindre !" />
              </div>
              <div>
                <label className={labelClass}>Label (texte au-dessus du titre)</label>
                <input type="text" value={formLabel} onChange={(e) => setFormLabel(e.target.value)}
                  className={inputClass} placeholder="Rejoignez-nous" />
              </div>
              <div>
                <label className={labelClass}>Texte du bouton de soumission</label>
                <input type="text" value={formCtaText} onChange={(e) => setFormCtaText(e.target.value)}
                  className={inputClass} placeholder="Envoyer ma demande" />
              </div>
              <div>
                <label className={labelClass}>
                  HubSpot Form GUID{" "}
                  <span className="text-luxury-slate/60 normal-case tracking-normal">(optionnel — laissez vide pour utiliser le formulaire par défaut)</span>
                </label>
                <input type="text" value={formHubspotFormId}
                  onChange={(e) => setFormHubspotFormId(e.target.value)}
                  className={inputClass} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
              </div>
            </div>
          </section>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" disabled={isSaving || uploadingVideo || uploadingLogo}
            className={`luxury-btn w-full py-5 ${(isSaving || uploadingVideo || uploadingLogo) ? "opacity-50 cursor-not-allowed" : ""}`}>
            {isSaving ? "Sauvegarde..." : mode === "create" ? "Créer la landing page" : "Enregistrer les modifications"}
          </button>
        </form>
      </div>

      <AssetPicker
        open={pickerOpen !== null}
        kind={pickerOpen === "hero" ? "video" : "image"}
        onClose={() => setPickerOpen(null)}
        onSelect={(asset) => {
          if (pickerOpen === "hero") {
            setForm((f) => ({ ...f, heroVideoUrl: asset.url }));
          } else if (pickerOpen === "logo") {
            const alt = asset.pathname.split("/").pop()?.replace(/\.[^.]+$/, "") || "";
            setSocialProofLogos((prev) => [...prev, { url: asset.url, alt }]);
          } else if (pickerOpen === "mission-photo") {
            setMissionPhotos((prev) => [...prev, asset.url]);
          }
          setPickerOpen(null);
        }}
      />

      <AssetPicker
        open={iconPickerIndex !== null}
        kind="image"
        onClose={() => setIconPickerIndex(null)}
        onSelect={(asset) => {
          if (iconPickerIndex !== null) {
            updateCard(iconPickerIndex, "iconImage", asset.url);
          }
          setIconPickerIndex(null);
        }}
      />

      <AssetPicker
        open={testimonialPhotoPickerIndex !== null}
        kind="image"
        onClose={() => setTestimonialPhotoPickerIndex(null)}
        onSelect={(asset) => {
          if (testimonialPhotoPickerIndex !== null) {
            updateTestimonial(testimonialPhotoPickerIndex, "authorPhoto", asset.url);
          }
          setTestimonialPhotoPickerIndex(null);
        }}
      />

      <AssetPicker
        open={urgencyIconPickerIndex !== null}
        kind="image"
        onClose={() => setUrgencyIconPickerIndex(null)}
        onSelect={(asset) => {
          if (urgencyIconPickerIndex !== null) {
            updateUrgencyStep(urgencyIconPickerIndex, "iconImage", asset.url);
          }
          setUrgencyIconPickerIndex(null);
        }}
      />
    </main>
  );
}

// `<input type="datetime-local">` only accepts the local "YYYY-MM-DDTHH:mm"
// format, but we persist the deadline as a full ISO string. This converts an
// ISO string back to the local-time representation the input expects.
function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="luxury-divider" />
      <h2 className="font-serif text-xl text-luxury-charcoal whitespace-nowrap">{children}</h2>
    </div>
  );
}
