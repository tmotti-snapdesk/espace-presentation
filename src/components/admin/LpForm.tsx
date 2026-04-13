"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { LandingPageData } from "@/types/lp";

interface LpFormProps {
  mode: "create" | "edit";
  initialData?: LandingPageData;
}

export default function LpForm({ mode, initialData }: LpFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    slug: initialData?.slug || "",
    internalTitle: initialData?.internalTitle || "",
    heroTitle: initialData?.heroTitle || "",
    heroSubtitle: initialData?.heroSubtitle || "",
    heroCtaText: initialData?.heroCtaText || "En savoir plus",
    heroVideoUrl: initialData?.heroVideoUrl || "",
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setUploadingVideo(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setForm((f) => ({ ...f, heroVideoUrl: blob.url }));
    } catch {
      setError("Erreur lors de l'upload de la vidéo.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug) { setError("Le slug est requis."); return; }
    setIsSaving(true);
    setError(null);

    try {
      let res: Response;
      if (mode === "create") {
        res = await fetch("/api/lp/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, ...initialData }),
        });
      } else {
        res = await fetch(`/api/lp/${initialData!.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...initialData, ...form }),
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

  const inputClass =
    "w-full px-4 py-3 border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm bg-white";
  const labelClass = "block text-xs uppercase tracking-[0.15em] text-luxury-slate mb-2 font-medium";

  return (
    <main className="min-h-screen bg-luxury-cream">
      {/* Header */}
      <div className="bg-luxury-charcoal text-white py-8 px-6 md:px-12">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="luxury-label text-luxury-gold mb-1">Snapdesk</p>
            <h1 className="font-serif text-2xl">
              {mode === "create" ? "Nouvelle Landing Page" : "Modifier la LP"}
            </h1>
          </div>
          <a href="/admin/lp" className="text-white/60 text-sm hover:text-white transition-colors">
            ← Retour
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-12 px-6 md:px-12">
        {savedUrl ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h2 className="font-serif text-2xl text-luxury-charcoal mb-4">
              {mode === "create" ? "LP créée !" : "LP mise à jour !"}
            </h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <a href={savedUrl} target="_blank" rel="noopener noreferrer" className="luxury-btn">
                Voir la LP
              </a>
              <a href="/admin/lp" className="luxury-btn-outline">
                Retour au dashboard
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* ── Identité ── */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="luxury-divider" />
                <h2 className="font-serif text-xl text-luxury-charcoal">Identité</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Titre interne (usage admin uniquement)</label>
                  <input
                    type="text"
                    value={form.internalTitle}
                    onChange={set("internalTitle")}
                    className={inputClass}
                    placeholder="Campagne Office Manager Q2 2026"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Slug URL{" "}
                    {mode === "edit" && (
                      <span className="text-luxury-slate/60 normal-case tracking-normal">
                        (non modifiable après création)
                      </span>
                    )}
                  </label>
                  <div className="flex items-center border border-primary-200 focus-within:border-luxury-gold transition-colors bg-white">
                    <span className="px-4 py-3 text-sm text-luxury-slate/60 border-r border-primary-200 shrink-0">
                      /lp/
                    </span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={set("slug")}
                      className="flex-1 px-4 py-3 text-sm focus:outline-none"
                      placeholder="campagne-office-manager"
                      required
                      disabled={mode === "edit"}
                      pattern="[a-z0-9-]+"
                      title="Minuscules, chiffres et tirets uniquement"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Hero ── */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="luxury-divider" />
                <h2 className="font-serif text-xl text-luxury-charcoal">Hero</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Vidéo de fond</label>
                  {form.heroVideoUrl && (
                    <div className="mb-3 flex items-center gap-3 p-3 bg-primary-50 border border-primary-100 text-xs text-luxury-slate">
                      <span className="truncate flex-1">{form.heroVideoUrl}</span>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, heroVideoUrl: "" }))}
                        className="shrink-0 text-red-400 hover:text-red-600"
                      >
                        Retirer
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime"
                    onChange={handleVideoChange}
                    className="w-full text-sm text-luxury-slate file:mr-4 file:py-2 file:px-4 file:border file:border-primary-200 file:text-xs file:uppercase file:tracking-wider file:bg-white file:text-luxury-charcoal hover:file:bg-primary-50 file:cursor-pointer cursor-pointer"
                  />
                  {uploadingVideo && (
                    <p className="text-xs text-luxury-slate mt-2">Upload en cours...</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Titre principal</label>
                  <input
                    type="text"
                    value={form.heroTitle}
                    onChange={set("heroTitle")}
                    className={inputClass}
                    placeholder="Faites le plein de vitamines au bureau !"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Sous-titre</label>
                  <textarea
                    value={form.heroSubtitle}
                    onChange={set("heroSubtitle")}
                    className={inputClass}
                    rows={3}
                    placeholder="Gagnez 1 mois de corbeilles de fruits frais livrées dans vos locaux..."
                  />
                </div>

                <div>
                  <label className={labelClass}>Texte du bouton CTA</label>
                  <input
                    type="text"
                    value={form.heroCtaText}
                    onChange={set("heroCtaText")}
                    className={inputClass}
                    placeholder="J'inscris mon équipe"
                    required
                  />
                  <p className="text-xs text-luxury-slate/60 mt-1">
                    Ce bouton descend automatiquement vers le formulaire.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Futures sections ── */}
            <section className="border border-dashed border-primary-200 p-6 text-center">
              <p className="text-sm text-luxury-slate/60">
                Les sections <strong>Notre métier</strong>, <strong>Social proof</strong> et{" "}
                <strong>Formulaire</strong> seront disponibles prochainement.
              </p>
            </section>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSaving || uploadingVideo}
              className={`luxury-btn w-full py-5 ${(isSaving || uploadingVideo) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSaving ? "Sauvegarde..." : mode === "create" ? "Créer la landing page" : "Enregistrer les modifications"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
