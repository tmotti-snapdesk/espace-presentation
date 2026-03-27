"use client";

import { useState, useEffect } from "react";
import { EspaceData } from "@/types/espace";
import EspaceForm from "@/components/admin/EspaceForm";

export default function EditEspacePage({
  params,
}: {
  params: { slug: string };
}) {
  const [espace, setEspace] = useState<EspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/espaces/${params.slug}`);
        if (!res.ok) throw new Error("Espace non trouvé");
        const data = await res.json();
        setEspace(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug]);

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
          <a href="/admin" className="text-luxury-gold hover:text-luxury-charcoal transition-colors">
            &larr; Retour au dashboard
          </a>
        </div>
      </main>
    );
  }

  return <EspaceForm mode="edit" initialData={espace} />;
}
