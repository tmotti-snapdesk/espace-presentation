"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface LeadFormSectionProps {
  espaceName: string;
  espaceSlug: string;
}

type Intent = "dossier" | "visite";

export default function LeadFormSection({ espaceName, espaceSlug }: LeadFormSectionProps) {
  const [intent, setIntent] = useState<Intent>("dossier");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    company: "",
    phone: "",
    headcount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          intent,
          espaceName,
          espaceSlug,
          source: typeof window !== "undefined" ? window.location.href : "",
          utm: typeof window !== "undefined" ? window.location.search : "",
          createdAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi");

      setIsSubmitted(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const intentCopy = {
    dossier: {
      heading: "Recevez le dossier complet",
      subheading: "Plans, photos haute définition, conditions détaillées — directement dans votre boîte mail.",
      cta: "Recevoir le dossier",
      success: "Vous allez recevoir le dossier complet par email.",
    },
    visite: {
      heading: "Organisons votre visite",
      subheading: "Découvrez l'espace en personne. Notre équipe vous recontacte pour fixer un créneau.",
      cta: "Demander une visite",
      success: "Notre équipe vous recontacte sous 24h pour organiser votre visite.",
    },
  }[intent];

  return (
    <section className="section-padding bg-white border-t border-primary-100">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Cet espace vous intéresse</p>
          <h2 className="luxury-heading text-luxury-charcoal mb-4">
            {intentCopy.heading}
          </h2>
          <div className="luxury-divider mx-auto mb-6" />
          <p className="text-lg text-luxury-slate font-light">
            {intentCopy.subheading}
          </p>
        </motion.div>

        {isSubmitted ? (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
              <span className="text-green-600 text-2xl">&#10003;</span>
            </div>
            <h3 className="font-serif text-2xl text-luxury-charcoal mb-3">
              Merci !
            </h3>
            <p className="text-luxury-slate font-light">
              {intentCopy.success}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {/* Intent toggle */}
            <div className="grid grid-cols-2 gap-3 mb-8 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setIntent("dossier")}
                className={`px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 border ${
                  intent === "dossier"
                    ? "bg-luxury-charcoal text-white border-luxury-charcoal"
                    : "bg-white text-luxury-charcoal border-primary-200 hover:border-luxury-gold"
                }`}
              >
                Recevoir le dossier
              </button>
              <button
                type="button"
                onClick={() => setIntent("visite")}
                className={`px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 border ${
                  intent === "visite"
                    ? "bg-luxury-charcoal text-white border-luxury-charcoal"
                    : "bg-white text-luxury-charcoal border-primary-200 hover:border-luxury-gold"
                }`}
              >
                Visiter l&apos;espace
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
              <div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-5 py-4 border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm"
                  placeholder="Email professionnel *"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  className="w-full px-5 py-4 border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm"
                  placeholder="Entreprise *"
                />
              </div>
              {intent === "visite" && (
                <div>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-5 py-4 border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm"
                    placeholder="Téléphone *"
                  />
                </div>
              )}
              <div>
                <select
                  value={form.headcount}
                  onChange={(e) => setForm((f) => ({ ...f, headcount: e.target.value }))}
                  className="w-full px-5 py-4 border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm text-luxury-slate appearance-none bg-white"
                >
                  <option value="">Nombre de postes recherchés (facultatif)</option>
                  <option value="Entre 1 à 5">Entre 1 à 5</option>
                  <option value="5 à 10 postes">5 à 10 postes</option>
                  <option value="10 à 20 postes">10 à 20 postes</option>
                  <option value="20 à 50 postes">20 à 50 postes</option>
                  <option value="50 à 100 postes">50 à 100 postes</option>
                  <option value="> à 100 postes">&gt; à 100 postes</option>
                </select>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`luxury-btn w-full text-sm py-5 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Envoi en cours..." : intentCopy.cta}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </section>
  );
}
