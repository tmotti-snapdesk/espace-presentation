"use client";

import { useState, useEffect } from "react";
import { LandingPageData } from "@/types/lp";
import LpForm from "@/components/admin/LpForm";

export default function EditLpPage({ params }: { params: { slug: string } }) {
  const [lp, setLp] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/lp/${params.slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("LP non trouvée");
        return r.json();
      })
      .then(setLp)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <p className="text-luxury-slate">Chargement...</p>
      </main>
    );
  }

  if (error || !lp) {
    return (
      <main className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "LP non trouvée"}</p>
          <a href="/admin/lp" className="text-luxury-gold hover:text-luxury-charcoal transition-colors">
            ← Retour au dashboard
          </a>
        </div>
      </main>
    );
  }

  return <LpForm mode="edit" initialData={lp} />;
}
