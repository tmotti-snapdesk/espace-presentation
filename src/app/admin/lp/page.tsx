"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LandingPageData } from "@/types/lp";

export default function LpDashboard() {
  const [lps, setLps] = useState<LandingPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/lp")
      .then((r) => r.json())
      .then((data) => setLps(data.lps || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Supprimer la LP "${slug}" ? Cette action est irréversible.`)) return;
    setDeleting(slug);
    const res = await fetch(`/api/lp/${slug}`, { method: "DELETE" });
    if (res.ok) setLps((prev) => prev.filter((lp) => lp.slug !== slug));
    setDeleting(null);
  };

  const handleDuplicate = async (slug: string) => {
    setDuplicating(slug);
    try {
      const res = await fetch(`/api/lp/${slug}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const newRes = await fetch(`/api/lp/${data.slug}`);
        if (newRes.ok) {
          const newLp = await newRes.json();
          setLps((prev) => [newLp, ...prev]);
        }
      }
    } catch {}
    setDuplicating(null);
  };

  return (
    <main className="min-h-screen bg-luxury-cream">
      <div className="bg-luxury-charcoal text-white py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="luxury-label text-luxury-gold mb-1">Snapdesk</p>
            <h1 className="font-serif text-2xl">Landing Pages</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-white/60 text-sm hover:text-white transition-colors">
              ← Espaces
            </Link>
            <Link href="/admin/lp/nouveau" className="luxury-btn text-sm">
              + Nouvelle LP
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-12 px-6 md:px-12">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-luxury-slate">Chargement...</p>
          </div>
        ) : lps.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-luxury-slate text-lg mb-6">Aucune landing page créée.</p>
            <Link href="/admin/lp/nouveau" className="luxury-btn">
              Créer votre première LP
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {lps.map((lp) => (
              <div
                key={lp.slug}
                className="bg-white border border-primary-100 rounded-lg p-6 flex items-center justify-between gap-6 hover:shadow-md transition-shadow"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-xl text-luxury-charcoal mb-1 truncate">
                    {lp.internalTitle}
                  </h2>
                  <p className="text-sm text-luxury-slate font-mono">/lp/{lp.slug}</p>
                  <p className="text-xs text-luxury-slate/60 mt-1">
                    Créé le {new Date(lp.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={`/lp/${lp.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded"
                  >
                    Voir
                  </a>
                  <Link
                    href={`/admin/lp/${lp.slug}`}
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDuplicate(lp.slug)}
                    disabled={duplicating === lp.slug}
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded disabled:opacity-50"
                  >
                    {duplicating === lp.slug ? "..." : "Dupliquer"}
                  </button>
                  <button
                    onClick={() => handleDelete(lp.slug)}
                    disabled={deleting === lp.slug}
                    className="px-4 py-2 text-sm border border-red-200 text-red-500 hover:bg-red-50 transition-colors rounded disabled:opacity-50"
                  >
                    {deleting === lp.slug ? "..." : "Supprimer"}
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
