"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface LpLeadFormProps {
  title?: string;
  label?: string;
  ctaText?: string;
  hubspotFormId?: string;
  lpSlug: string;
  lpTitle: string;
}

const HEADCOUNT_OPTIONS = [
  "Entre 1 et 5",
  "6 à 10",
  "11 à 20",
  "21 à 50",
  "Plus de 50",
];

const PROJECT_OPTIONS = [
  "Oui, dans les 3 prochains mois",
  "Oui, dans les 6 prochains mois",
  "Peut-être d'ici 1 an",
  "Pas pour l'instant",
];

export default function LpLeadForm({
  title,
  label,
  ctaText = "Envoyer ma demande",
  hubspotFormId,
  lpSlug,
  lpTitle,
}: LpLeadFormProps) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    company: "",
    address: "",
    headcount: "",
    project: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

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
          firstname: form.firstname,
          lastname: form.lastname,
          address: form.address,
          headcount: form.headcount,
          project: form.project,
          espaceName: lpTitle,
          espaceSlug: lpSlug,
          hubspotFormId: hubspotFormId || undefined,
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

  const inputClass =
    "w-full px-5 py-4 border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm bg-white";

  return (
    <section id="form" className="bg-luxury-charcoal section-padding">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          {label && <p className="luxury-label text-luxury-gold mb-4">{label}</p>}
          {title && (
            <motion.h2
              className="luxury-subheading text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {title}
            </motion.h2>
          )}
          <div className="luxury-divider mx-auto mt-6" />
        </div>

        {isSubmitted ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h3 className="font-serif text-2xl text-white mb-3">Merci !</h3>
            <p className="text-white/70 font-light">
              Nous avons bien reçu votre demande et reviendrons vers vous rapidement.
            </p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Row 1 : prénom / nom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={form.firstname}
                onChange={set("firstname")}
                className={inputClass}
                placeholder="Prénom *"
              />
              <input
                type="text"
                required
                value={form.lastname}
                onChange={set("lastname")}
                className={inputClass}
                placeholder="Nom *"
              />
            </div>

            {/* Row 2 : email / entreprise */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                className={inputClass}
                placeholder="Email professionnel *"
              />
              <input
                type="text"
                required
                value={form.company}
                onChange={set("company")}
                className={inputClass}
                placeholder="Entreprise *"
              />
            </div>

            {/* Row 3 : adresse / effectif */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={form.address}
                onChange={set("address")}
                className={inputClass}
                placeholder="Adresse des bureaux *"
              />
              <select
                required
                value={form.headcount}
                onChange={set("headcount")}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Effectif *</option>
                {HEADCOUNT_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Row 4 : projet bureau */}
            <select
              value={form.project}
              onChange={set("project")}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Projet de nouveaux bureaux ?</option>
              {PROJECT_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-8 py-5 bg-luxury-gold text-luxury-charcoal text-sm uppercase tracking-[0.15em] font-medium transition-all duration-300 hover:bg-luxury-champagne ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Envoi en cours..." : ctaText}
            </button>

            <p className="text-center text-xs text-white/40 pt-2">
              Données traitées conformément à notre politique de confidentialité.
            </p>
          </motion.form>
        )}
      </div>
    </section>
  );
}
