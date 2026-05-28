"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EspaceData } from "@/types/espace";
import { RapportData } from "@/types/rapport";
import RapportForm from "@/components/admin/RapportForm";

export default function EditRapportPage({
  params,
}: {
  params: { slug: string; month: string };
}) {
  const [espace, setEspace] = useState<EspaceData | null>(null);
  const [rapport, setRapport] = useState<RapportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [espaceRes, rapportRes] = await Promise.all([
          fetch(`/api/espaces/${params.slug}`),
          fetch(`/api/rapports/${params.slug}/${params.month}`),
        ]);
        if (!espaceRes.ok) throw new Error("Espace non trouvé");
        if (!rapportRes.ok) throw new Error("Rapport non trouvé");
        setEspace(await espaceRes.json());
        setRapport(await rapportRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug, params.month]);

  if (loading) {
    return (
      <main className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <p className="text-luxury-slate">Chargement...</p>
      </main>
    );
  }

  if (error || !espace || !rapport) {
    return (
      <main className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Rapport non trouvé"}</p>
          <Link
            href={`/admin/${params.slug}/rapports`}
            className="text-luxury-gold hover:text-luxury-charcoal transition-colors"
          >
            &larr; Rapports de l&apos;espace
          </Link>
        </div>
      </main>
    );
  }

  const fullAddress = [espace.address, espace.postalCode, espace.city]
    .filter(Boolean)
    .join(", ");

  return (
    <RapportForm
      mode="edit"
      espaceSlug={espace.slug}
      espaceName={espace.name}
      espaceAddress={fullAddress}
      initialData={rapport}
    />
  );
}
