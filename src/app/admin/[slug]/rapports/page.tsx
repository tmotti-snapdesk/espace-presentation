"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EspaceData } from "@/types/espace";
import { RapportData, formatMonthLabel } from "@/types/rapport";

export default function EspaceRapportsPage({
  params,
}: {
  params: { slug: string };
}) {
  const [espace, setEspace] = useState<EspaceData | null>(null);
  const [rapport, setRapport] = useState<RapportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingMonth, setDeletingMonth] = useState<string | null>(null);
  const [deletingRapport, setDeletingRapport] = useState(false);

  const load = async () => {
    try {
      const [espaceRes, rapportRes] = await Promise.all([
        fetch(`/api/espaces/${params.slug}`),
        fetch(`/api/rapports?espaceSlug=${params.slug}`),
      ]);
      if (!espaceRes.ok) throw new Error("Espace non trouvé");
      const espaceData = await espaceRes.json();
      const rapportsData = await rapportRes.json();
      setEspace(espaceData);
      setRapport(rapportsData.rapports?.[0] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [params.slug]);

  const handleDeleteMonth = async (month: string) => {
    if (!confirm(`Supprimer l'onglet ${formatMonthLabel(month)} ?`)) return;
    setDeletingMonth(month);
    try {
      const res = await fetch(`/api/rapports/${params.slug}?month=${month}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRapport((prev) =>
          prev ? { ...prev, months: prev.months.filter((m) => m.month !== month) } : prev
        );
      }
    } finally {
      setDeletingMonth(null);
    }
  };

  const handleDeleteRapport = async () => {
    if (!confirm("Supprimer entièrement le rapport de cet espace ?")) return;
    setDeletingRapport(true);
    try {
      const res = await fetch(`/api/rapports/${params.slug}`, { method: "DELETE" });
      if (res.ok) setRapport(null);
    } finally {
      setDeletingRapport(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <p className="text-luxury-slate">Chargement...</p>
      </main>
    );
  }

  if (error || !espace) {
    return (
      <main className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Espace non trouvé"}</p>
          <Link
            href="/admin"
            className="text-luxury-gold hover:text-luxury-charcoal transition-colors"
          >
            &larr; Retour au dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-luxury-cream">
      <div className="bg-luxury-charcoal text-white py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="luxury-label text-luxury-gold mb-1">
              {espace.name}
            </p>
            <h1 className="font-serif text-2xl">Rapport de commercialisation</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              &larr; Dashboard
            </Link>
            {rapport && (
              <Link
                href={`/admin/${params.slug}/rapports/${rapport.months[0]?.month || ""}`}
                className="luxury-btn text-sm"
              >
                Modifier le rapport
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-12 px-6 md:px-12">
        {!rapport ? (
          <div className="text-center py-20">
            <p className="text-luxury-slate text-lg mb-6">
              Aucun rapport n&apos;a encore été généré pour cet espace.
            </p>
            <Link
              href={`/admin/${params.slug}/rapports/nouveau`}
              className="luxury-btn"
            >
              Créer le rapport
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white border border-primary-100 rounded-lg p-6 mb-8">
              <h2 className="font-serif text-xl text-luxury-charcoal mb-1">
                {rapport.ownerName || "Destinataire non renseigné"}
              </h2>
              <p className="text-sm text-luxury-slate">{rapport.espaceAddress}</p>
              <p className="text-xs text-luxury-slate/60 mt-2">
                Dernière mise à jour :{" "}
                {new Date(rapport.updatedAt).toLocaleDateString("fr-FR")}
              </p>
              <button
                onClick={handleDeleteRapport}
                disabled={deletingRapport}
                className="mt-4 text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                {deletingRapport ? "Suppression..." : "Supprimer entièrement le rapport"}
              </button>
            </div>

            <h3 className="text-sm uppercase tracking-wider text-luxury-slate mb-4">
              Onglets mensuels
            </h3>
            <div className="grid gap-4">
              {rapport.months.map((m) => (
                <div
                  key={m.month}
                  className="bg-white border border-primary-100 rounded-lg p-6 flex items-center justify-between gap-6 transition-shadow hover:shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-xl text-luxury-charcoal mb-1 capitalize">
                      {formatMonthLabel(m.month)}
                    </h2>
                    <p className="text-sm text-luxury-slate">
                      {m.visites.length} visite{m.visites.length > 1 ? "s" : ""}{" "}
                      &middot; {m.matchingFormsCount} formulaire
                      {m.matchingFormsCount > 1 ? "s" : ""} matché
                      {m.matchingFormsCount > 1 ? "s" : ""} &middot; budget mois{" "}
                      {m.monthlyBudget || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={`/espaces/${rapport.espaceSlug}/rapports/${m.month}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded"
                    >
                      Voir
                    </a>
                    <Link
                      href={`/admin/${rapport.espaceSlug}/rapports/${m.month}`}
                      className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDeleteMonth(m.month)}
                      disabled={deletingMonth === m.month}
                      className="px-4 py-2 text-sm border border-red-200 text-red-500 hover:bg-red-50 transition-colors rounded disabled:opacity-50"
                    >
                      {deletingMonth === m.month ? "..." : "Supprimer"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
