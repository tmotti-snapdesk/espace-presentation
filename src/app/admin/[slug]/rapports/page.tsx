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
  const [rapports, setRapports] = useState<RapportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    try {
      const [espaceRes, rapportsRes] = await Promise.all([
        fetch(`/api/espaces/${params.slug}`),
        fetch(`/api/rapports?espaceSlug=${params.slug}`),
      ]);
      if (!espaceRes.ok) throw new Error("Espace non trouvé");
      const espaceData = await espaceRes.json();
      const rapportsData = await rapportsRes.json();
      setEspace(espaceData);
      setRapports(rapportsData.rapports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [params.slug]);

  const handleDelete = async (month: string) => {
    if (!confirm(`Supprimer le rapport ${formatMonthLabel(month)} ?`)) return;
    setDeleting(month);
    try {
      const res = await fetch(`/api/rapports/${params.slug}/${month}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRapports((prev) => prev.filter((r) => r.month !== month));
      }
    } finally {
      setDeleting(null);
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
            <h1 className="font-serif text-2xl">Rapports de commercialisation</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              &larr; Dashboard
            </Link>
            <Link
              href={`/admin/${params.slug}/rapports/nouveau`}
              className="luxury-btn text-sm"
            >
              + Nouveau rapport
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-12 px-6 md:px-12">
        {rapports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-luxury-slate text-lg mb-6">
              Aucun rapport n&apos;a encore été généré pour cet espace.
            </p>
            <Link
              href={`/admin/${params.slug}/rapports/nouveau`}
              className="luxury-btn"
            >
              Créer le premier rapport
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {rapports.map((r) => (
              <div
                key={`${r.espaceSlug}-${r.month}`}
                className="bg-white border border-primary-100 rounded-lg p-6 flex items-center justify-between gap-6 transition-shadow hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-xl text-luxury-charcoal mb-1 capitalize">
                    {formatMonthLabel(r.month)}
                  </h2>
                  <p className="text-sm text-luxury-slate">
                    {r.visites.length} visite{r.visites.length > 1 ? "s" : ""}{" "}
                    &middot; {r.matchingFormsCount} formulaire
                    {r.matchingFormsCount > 1 ? "s" : ""} matché
                    {r.matchingFormsCount > 1 ? "s" : ""} &middot; budget mois{" "}
                    {r.monthlyBudget || "—"}
                  </p>
                  <p className="text-xs text-luxury-slate/60 mt-1">
                    Dernière mise à jour :{" "}
                    {new Date(r.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={`/espaces/${r.espaceSlug}/rapports/${r.month}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded"
                  >
                    Voir
                  </a>
                  <Link
                    href={`/admin/${r.espaceSlug}/rapports/${r.month}`}
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(r.month)}
                    disabled={deleting === r.month}
                    className="px-4 py-2 text-sm border border-red-200 text-red-500 hover:bg-red-50 transition-colors rounded disabled:opacity-50"
                  >
                    {deleting === r.month ? "..." : "Supprimer"}
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
