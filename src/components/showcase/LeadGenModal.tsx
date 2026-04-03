"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LeadGenModalProps {
  espaceName: string;
  espaceSlug: string;
}

export default function LeadGenModal({ espaceName, espaceSlug }: LeadGenModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    email: "",
    company: "",
    headcount: "",
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

      setIsSubmitted(true);
      setTimeout(() => setIsOpen(false), 2500);
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
              className="fixed inset-0 bg-black/60 z-50"
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
                className="bg-white w-full max-w-lg relative"
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8 md:p-12">
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
                        Vous allez recevoir la présentation complète de {espaceName} par email.
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="text-center mb-8">
                        <p className="luxury-label mb-3">Intéressé par cet espace ?</p>
                        <h3 className="font-serif text-2xl md:text-3xl text-luxury-charcoal mb-3">
                          Recevez la présentation<br />complète de {espaceName}
                        </h3>
                        <div className="luxury-divider mx-auto" />
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            className="w-full px-4 py-3 border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm"
                            placeholder="Email professionnel *"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            required
                            value={form.company}
                            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                            className="w-full px-4 py-3 border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm"
                            placeholder="Entreprise *"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={form.headcount}
                            onChange={(e) => setForm((f) => ({ ...f, headcount: e.target.value }))}
                            className="w-full px-4 py-3 border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm"
                            placeholder="Nombre de postes recherchés (facultatif)"
                          />
                        </div>

                        {error && (
                          <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`luxury-btn w-full text-sm py-4 ${
                            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {isSubmitting
                            ? "Envoi en cours..."
                            : "Recevoir la présentation complète"}
                        </button>

                        <p className="text-xs text-luxury-slate/60 text-center">
                          Vos données ne seront utilisées que pour vous envoyer cette présentation.
                        </p>
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
