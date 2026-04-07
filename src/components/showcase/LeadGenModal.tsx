"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LeadGenMode } from "@/types/espace";

interface LeadGenModalProps {
  espaceName: string;
  espaceSlug: string;
  leadGenMode?: LeadGenMode;
  presentationLink?: string;
}

export default function LeadGenModal({ espaceName, espaceSlug, leadGenMode = "unlock", presentationLink = "" }: LeadGenModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    email: "",
    company: "",
    searchingForOffice: false,
  });

  // Trigger modal on scroll (when the trigger div enters viewport)
  useEffect(() => {
    if (hasBeenDismissed || isSubmitted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenDismissed && !isSubmitted) {
          setIsOpen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const el = triggerRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [hasBeenDismissed, isSubmitted]);

  const handleClose = () => {
    setIsOpen(false);
    setHasBeenDismissed(true);
  };

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
          espaceName,
          espaceSlug,
          source: typeof window !== "undefined" ? window.location.href : "",
          utm: typeof window !== "undefined" ? window.location.search : "",
          createdAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi");

      if (leadGenMode === "redirect" && presentationLink) {
        window.open(presentationLink, "_blank");
        setIsSubmitted(true);
        setTimeout(() => setIsOpen(false), 2500);
      } else {
        setIsSubmitted(true);
        setTimeout(() => setIsOpen(false), 2500);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Invisible trigger element — placed before FloorPlan in the page */}
      <div ref={triggerRef} className="h-0 w-0" aria-hidden />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white w-full max-w-2xl relative"
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-10 md:p-16">
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
                        {leadGenMode === "voir_suite"
                          ? "Bonne découverte de l'espace !"
                          : leadGenMode === "redirect"
                            ? "La présentation s'ouvre dans un nouvel onglet."
                            : "Vous allez recevoir la présentation complète par email."}
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="text-center mb-10">
                        <p className="luxury-label mb-4">Intéressé par cet espace ?</p>
                        <h3 className="font-serif text-3xl md:text-4xl text-luxury-charcoal mb-4">
                          Recevez la présentation<br />complète
                        </h3>
                        <div className="luxury-divider mx-auto" />
                      </div>

                      {/* Form */}
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
                        <label
                          className={`flex items-center gap-3 px-5 py-4 border cursor-pointer transition-colors text-sm ${
                            form.searchingForOffice
                              ? "border-luxury-gold bg-luxury-champagne/20 text-luxury-charcoal"
                              : "border-primary-200 text-luxury-slate"
                          }`}
                          onClick={() => setForm((f) => ({ ...f, searchingForOffice: !f.searchingForOffice }))}
                        >
                          <div
                            className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${
                              form.searchingForOffice ? "bg-luxury-gold" : "bg-primary-200"
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                form.searchingForOffice ? "translate-x-5" : "translate-x-1"
                              }`}
                            />
                          </div>
                          <span>Je recherche actuellement des bureaux</span>
                        </label>

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
                          {isSubmitting
                            ? "Envoi en cours..."
                            : leadGenMode === "voir_suite"
                              ? "Voir la suite"
                              : "Recevoir la présentation complète"}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
