"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type RequestType = "dossier" | "visite";

interface LeadCaptureSectionProps {
  espaceName: string;
  espaceSlug: string;
}

const REQUEST_LABELS: Record<RequestType, string> = {
  dossier: "Recevoir le dossier",
  visite: "Visiter l'espace",
};

export default function LeadCaptureSection({ espaceName, espaceSlug }: LeadCaptureSectionProps) {
  const [requestType, setRequestType] = useState<RequestType>("dossier");
  const [form, setForm] = useState({ email: "", company: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          company: form.company,
          project: REQUEST_LABELS[requestType],
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

  return (
    <section className="section-padding bg-luxury-charcoal">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="luxury-label text-luxury-gold mb-4">Vous êtes intéressé ?</p>
          <h2 className="luxury-heading text-white mb-4">
            Recevez le dossier<br />ou visitez l&apos;espace
          </h2>
          <div className="luxury-divider mx-auto" />
        </motion.div>

        {isSubmitted ? (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white text-2xl">&#10003;</span>
            </div>
            <h3 className="font-serif text-2xl text-white mb-3">Merci !</h3>
            <p className="text-white/70 font-light">
              {requestType === "visite"
                ? "Nous revenons vers vous rapidement pour organiser la visite."
                : "Vous allez recevoir le dossier complet par email."}
            </p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(REQUEST_LABELS) as RequestType[]).map((type) => {
                const active = requestType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRequestType(type)}
                    className={`px-5 py-4 border text-sm uppercase tracking-[0.15em] transition-colors ${
                      active
                        ? "border-luxury-gold bg-luxury-gold text-luxury-charcoal"
                        : "border-white/30 text-white hover:border-luxury-gold"
                    }`}
                  >
                    {REQUEST_LABELS[type]}
                  </button>
                );
              })}
            </div>

            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-5 py-4 bg-white border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm"
              placeholder="Email professionnel *"
            />
            <input
              type="text"
              required
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className="w-full px-5 py-4 bg-white border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm"
              placeholder="Entreprise *"
            />

            {error && <p className="text-red-300 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-8 py-5 bg-luxury-gold text-luxury-charcoal text-sm uppercase tracking-[0.15em] font-medium transition-colors hover:bg-luxury-champagne ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Envoi en cours..." : REQUEST_LABELS[requestType]}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
