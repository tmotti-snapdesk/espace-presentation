"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EspaceData } from "@/types/espace";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminDashboard() {
  const [espaces, setEspaces] = useState<EspaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [togglingVisibility, setTogglingVisibility] = useState<string | null>(null);

  const fetchEspaces = async () => {
    try {
      const res = await fetch("/api/espaces");
      if (res.ok) {
        const data = await res.json();
        setEspaces(data.espaces);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspaces();
  }, []);

  const handleDuplicate = async (slug: string) => {
    setDuplicating(slug);
    try {
      const res = await fetch(`/api/espaces/${slug}`, { method: "POST" });
      if (res.ok) {
        await fetchEspaces();
      }
    } catch {
      // silently fail
    } finally {
      setDuplicating(null);
    }
  };

  const handleToggleVisibility = async (slug: string, nextVisible: boolean) => {
    setTogglingVisibility(slug);
    setEspaces((prev) =>
      prev.map((e) => (e.slug === slug ? { ...e, brokerDirectoryVisible: nextVisible } : e))
    );
    try {
      const res = await fetch(`/api/espaces/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brokerDirectoryVisible: nextVisible }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      setEspaces((prev) =>
        prev.map((e) => (e.slug === slug ? { ...e, brokerDirectoryVisible: !nextVisible } : e))
      );
    } finally {
      setTogglingVisibility(null);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Supprimer l'espace "${slug}" ? Cette action est irréversible.`)) return;
    setDeleting(slug);
    try {
      const res = await fetch(`/api/espaces/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setEspaces((prev) => prev.filter((e) => e.slug !== slug));
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="min-h-screen bg-luxury-cream">
      <AdminNav
        title="Dashboard"
        actions={
          <Link href="/admin/nouveau" className="luxury-btn text-sm">
            + Créer un espace
          </Link>
        }
      />

      <div className="max-w-5xl mx-auto py-12 px-6 md:px-12">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-luxury-slate">Chargement...</p>
          </div>
        ) : espaces.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-luxury-slate text-lg mb-6">Aucun espace créé pour le moment.</p>
            <Link href="/admin/nouveau" className="luxury-btn">
              Créer votre premier espace
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {espaces.map((espace) => (
              <div
                key={espace.slug}
                className="bg-white border border-primary-100 rounded-lg p-6 flex items-center justify-between gap-6 transition-shadow hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-xl text-luxury-charcoal mb-1 truncate">
                    {espace.name}
                  </h2>
                  <p className="text-sm text-luxury-slate">
                    {espace.workstations} postes &middot; {espace.address}, {espace.city} &middot; {espace.pricePerMonth}
                  </p>
                  <p className="text-xs text-luxury-slate/60 mt-1">
                    Créé le {new Date(espace.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleToggleVisibility(espace.slug, !(espace.brokerDirectoryVisible !== false))
                  }
                  disabled={togglingVisibility === espace.slug}
                  title="Visibilité sur l'annuaire brokers (/espaces)"
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 text-xs rounded border transition-colors disabled:opacity-50 ${
                    espace.brokerDirectoryVisible !== false
                      ? "border-luxury-gold/40 bg-luxury-champagne/20 text-luxury-charcoal"
                      : "border-primary-200 text-luxury-slate"
                  }`}
                >
                  <span
                    className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                      espace.brokerDirectoryVisible !== false ? "bg-luxury-gold" : "bg-primary-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        espace.brokerDirectoryVisible !== false ? "translate-x-3.5" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                  {espace.brokerDirectoryVisible !== false ? "Visible annuaire" : "Masqué annuaire"}
                </button>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={`/espaces/${espace.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded"
                  >
                    Voir
                  </a>
                  <a
                    href={`/espaces/${espace.slug}/fiche`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded"
                  >
                    Fiche broker
                  </a>
                  <Link
                    href={`/admin/${espace.slug}`}
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded"
                  >
                    Modifier
                  </Link>
                  <Link
                    href={`/admin/${espace.slug}/rapports`}
                    className="px-4 py-2 text-sm border border-luxury-gold/40 text-luxury-charcoal bg-luxury-champagne/30 hover:bg-luxury-champagne/60 transition-colors rounded"
                  >
                    Rapports
                  </Link>
                  <button
                    onClick={() => handleDuplicate(espace.slug)}
                    disabled={duplicating === espace.slug}
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded disabled:opacity-50"
                  >
                    {duplicating === espace.slug ? "..." : "Dupliquer"}
                  </button>
                  <button
                    onClick={() => handleDelete(espace.slug)}
                    disabled={deleting === espace.slug}
                    className="px-4 py-2 text-sm border border-red-200 text-red-500 hover:bg-red-50 transition-colors rounded disabled:opacity-50"
                  >
                    {deleting === espace.slug ? "..." : "Supprimer"}
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
