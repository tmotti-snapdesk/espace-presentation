"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EspaceData } from "@/types/espace";

export default function AdminDashboard() {
  const [espaces, setEspaces] = useState<EspaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapA, setSwapA] = useState("");
  const [swapB, setSwapB] = useState("");
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

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

  const handleSwap = async () => {
    if (!swapA || !swapB || swapA === swapB) {
      setSwapError("Sélectionne deux espaces différents");
      return;
    }
    const a = espaces.find((e) => e.slug === swapA)?.name || swapA;
    const b = espaces.find((e) => e.slug === swapB)?.name || swapB;
    if (!confirm(`Échanger les URLs de "${a}" et "${b}" ? Cette action est irréversible.`)) return;
    setSwapError(null);
    setSwapping(true);
    try {
      const res = await fetch("/api/espaces/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugA: swapA, slugB: swapB }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSwapError(data.error || "Échec de l'échange");
        return;
      }
      setSwapOpen(false);
      setSwapA("");
      setSwapB("");
      await fetchEspaces();
    } catch (err) {
      setSwapError(err instanceof Error ? err.message : "Échec de l'échange");
    } finally {
      setSwapping(false);
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
      {/* Header */}
      <div className="bg-luxury-charcoal text-white py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="luxury-label text-luxury-gold mb-1">Snapdesk</p>
            <h1 className="font-serif text-2xl">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSwapError(null);
                setSwapOpen(true);
              }}
              className="luxury-btn-outline text-sm border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              Échanger URLs
            </button>
            <Link href="/admin/lp" className="luxury-btn-outline text-sm border-white/30 text-white hover:bg-white/10 hover:text-white">
              Landing Pages
            </Link>
            <Link href="/admin/nouveau" className="luxury-btn text-sm">
              + Créer un espace
            </Link>
          </div>
        </div>
      </div>

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

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={`/espaces/${espace.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded"
                  >
                    Voir
                  </a>
                  <Link
                    href={`/admin/${espace.slug}`}
                    className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded"
                  >
                    Modifier
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

      {swapOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !swapping && setSwapOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl text-luxury-charcoal mb-2">
              Échanger deux URLs
            </h2>
            <p className="text-sm text-luxury-slate mb-5">
              Les contenus des deux espaces sélectionnés seront échangés sur leurs URLs respectives.
            </p>

            <label className="block text-sm text-luxury-charcoal mb-1">Espace A</label>
            <select
              value={swapA}
              onChange={(e) => setSwapA(e.target.value)}
              disabled={swapping}
              className="w-full border border-primary-200 rounded px-3 py-2 mb-4 text-sm"
            >
              <option value="">— Sélectionner —</option>
              {espaces.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.name} ({e.slug})
                </option>
              ))}
            </select>

            <label className="block text-sm text-luxury-charcoal mb-1">Espace B</label>
            <select
              value={swapB}
              onChange={(e) => setSwapB(e.target.value)}
              disabled={swapping}
              className="w-full border border-primary-200 rounded px-3 py-2 mb-4 text-sm"
            >
              <option value="">— Sélectionner —</option>
              {espaces
                .filter((e) => e.slug !== swapA)
                .map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.name} ({e.slug})
                  </option>
                ))}
            </select>

            {swapError && (
              <p className="text-sm text-red-600 mb-3">{swapError}</p>
            )}

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setSwapOpen(false)}
                disabled={swapping}
                className="px-4 py-2 text-sm border border-primary-200 text-luxury-charcoal hover:bg-primary-50 transition-colors rounded disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSwap}
                disabled={swapping || !swapA || !swapB || swapA === swapB}
                className="luxury-btn text-sm disabled:opacity-50"
              >
                {swapping ? "Échange en cours..." : "Échanger"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
