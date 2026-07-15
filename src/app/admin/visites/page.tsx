"use client";

import { useEffect, useState } from "react";
import { EspaceData } from "@/types/espace";
import { PendingVisite } from "@/types/visitePending";
import { formatMonthLabel } from "@/types/rapport";
import AdminNav from "@/components/admin/AdminNav";

export default function VisitesAValiderPage() {
  const [visites, setVisites] = useState<PendingVisite[]>([]);
  const [espaces, setEspaces] = useState<EspaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      const [visitesRes, espacesRes] = await Promise.all([
        fetch("/api/visites?status=pending"),
        fetch("/api/espaces"),
      ]);
      const visitesData = await visitesRes.json();
      const espacesData = await espacesRes.json();
      setVisites(visitesData.visites || []);
      setEspaces(espacesData.espaces || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateLocal = (id: string, patch: Partial<PendingVisite>) => {
    setVisites((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const saveEdits = async (visite: PendingVisite) => {
    setBusyId(visite.id);
    try {
      await fetch(`/api/visites/${visite.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          espaceSlug: visite.espaceSlug,
          month: visite.month,
          prospect: visite.prospect,
          feedback: visite.feedback,
          outcome: visite.outcome,
        }),
      });
    } finally {
      setBusyId(null);
    }
  };

  const regenerate = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/visites/${id}/reformulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: instructions[id] || "" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setVisites((prev) => prev.map((v) => (v.id === id ? updated : v)));
      }
    } finally {
      setBusyId(null);
    }
  };

  const publish = async (visite: PendingVisite) => {
    if (!visite.espaceSlug) {
      alert("Choisissez d'abord l'espace concerné.");
      return;
    }
    setBusyId(visite.id);
    try {
      const res = await fetch(`/api/visites/${visite.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          espaceSlug: visite.espaceSlug,
          month: visite.month,
          prospect: visite.prospect,
          feedback: visite.feedback,
          outcome: visite.outcome,
        }),
      });
      if (res.ok) {
        setVisites((prev) => prev.filter((v) => v.id !== visite.id));
      } else {
        const data = await res.json();
        alert(data.error || "Échec de la publication");
      }
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    if (!confirm("Rejeter cette visite ? Elle ne sera pas publiée.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/visites/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (res.ok) setVisites((prev) => prev.filter((v) => v.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-luxury-cream">
      <AdminNav title="Visites à valider" />

      <div className="max-w-5xl mx-auto py-12 px-6 md:px-12">
        {loading ? (
          <p className="text-luxury-slate text-center py-20">Chargement...</p>
        ) : visites.length === 0 ? (
          <p className="text-luxury-slate text-center py-20">
            Aucune visite en attente de validation.
          </p>
        ) : (
          <div className="space-y-6">
            {visites.map((v) => (
              <div key={v.id} className="bg-white border border-primary-100 rounded-lg p-6">
                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-luxury-slate">
                  <span className="uppercase tracking-wider">
                    Ligne Sheet #{v.sheetRowRef} &middot; reçue le{" "}
                    {new Date(v.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  {!v.suggestedEspaceSlug && (
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
                      Espace non reconnu — à choisir manuellement
                    </span>
                  )}
                  {v.geminiError && (
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
                      Gemini a échoué : notes brutes affichées
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-luxury-slate mb-2">
                      Espace
                    </label>
                    <select
                      value={v.espaceSlug || ""}
                      onChange={(e) => updateLocal(v.id, { espaceSlug: e.target.value || null })}
                      className="w-full px-3 py-2 border border-primary-200 rounded focus:outline-none focus:border-luxury-gold"
                    >
                      <option value="">— Choisir —</option>
                      {espaces.map((e) => (
                        <option key={e.slug} value={e.slug}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-luxury-slate mb-2">
                      Mois du rapport
                    </label>
                    <input
                      type="month"
                      value={v.month}
                      onChange={(e) => updateLocal(v.id, { month: e.target.value })}
                      className="w-full px-3 py-2 border border-primary-200 rounded focus:outline-none focus:border-luxury-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-luxury-slate mb-2">
                      Prospect
                    </label>
                    <input
                      type="text"
                      value={v.prospect}
                      onChange={(e) => updateLocal(v.id, { prospect: e.target.value })}
                      className="w-full px-3 py-2 border border-primary-200 rounded focus:outline-none focus:border-luxury-gold"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-wider text-luxury-slate mb-2">
                    Feedback (proposition Gemini — modifiable)
                  </label>
                  <textarea
                    value={v.feedback}
                    onChange={(e) => updateLocal(v.id, { feedback: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-primary-200 rounded focus:outline-none focus:border-luxury-gold resize-vertical"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-wider text-luxury-slate mb-2">
                    Suite donnée
                  </label>
                  <input
                    type="text"
                    value={v.outcome}
                    onChange={(e) => updateLocal(v.id, { outcome: e.target.value })}
                    className="w-full px-3 py-2 border border-primary-200 rounded focus:outline-none focus:border-luxury-gold"
                  />
                </div>

                <details className="mb-4">
                  <summary className="text-xs text-luxury-slate cursor-pointer">
                    Voir les notes brutes du Sheet
                  </summary>
                  <p className="mt-2 text-sm text-luxury-slate whitespace-pre-line">
                    {v.raw.feedbacks || "—"}
                  </p>
                </details>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-primary-100">
                  <input
                    type="text"
                    placeholder="Consigne pour Gemini (optionnel)"
                    value={instructions[v.id] || ""}
                    onChange={(e) =>
                      setInstructions((prev) => ({ ...prev, [v.id]: e.target.value }))
                    }
                    className="flex-1 min-w-[220px] px-3 py-2 text-sm border border-primary-200 rounded focus:outline-none focus:border-luxury-gold"
                  />
                  <button
                    type="button"
                    onClick={() => regenerate(v.id)}
                    disabled={busyId === v.id}
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded disabled:opacity-50"
                  >
                    Régénérer via Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => saveEdits(v)}
                    disabled={busyId === v.id}
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => publish(v)}
                    disabled={busyId === v.id}
                    className="luxury-btn text-sm disabled:opacity-50"
                  >
                    Publier dans le rapport
                  </button>
                  <button
                    type="button"
                    onClick={() => reject(v.id)}
                    disabled={busyId === v.id}
                    className="px-4 py-2 text-sm border border-red-200 text-red-500 hover:bg-red-50 transition-colors rounded disabled:opacity-50"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
