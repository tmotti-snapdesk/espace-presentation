"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EspaceData } from "@/types/espace";
import RapportForm from "@/components/admin/RapportForm";

export default function NewRapportPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [espace, setEspace] = useState<EspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [espaceRes, rapportRes] = await Promise.all([
          fetch(`/api/espaces/${params.slug}`),
          fetch(`/api/rapports?espaceSlug=${params.slug}`),
        ]);
        if (!espaceRes.ok) throw new Error("Espace non trouvé");
        const data = await espaceRes.json();
        const rapportsData = await rapportRes.json();
        const existing = rapportsData.rapports?.[0];
        if (existing) {
          // Un seul rapport par espace : redirige vers l'éditeur existant.
          router.replace(`/admin/${params.slug}/rapports/${existing.months[0]?.month || ""}`);
          return;
        }
        setEspace(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug, router]);

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

  const fullAddress = [espace.address, espace.postalCode, espace.city]
    .filter(Boolean)
    .join(", ");

  return (
    <RapportForm
      mode="create"
      espaceSlug={espace.slug}
      espaceName={espace.name}
      espaceAddress={fullAddress}
    />
  );
}
