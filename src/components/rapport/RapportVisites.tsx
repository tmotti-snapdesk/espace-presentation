"use client";

import { motion } from "framer-motion";
import { RapportVisite, formatLongDate } from "@/types/rapport";

interface RapportVisitesProps {
  visites: RapportVisite[];
  anonymizeProspects?: boolean;
}

export default function RapportVisites({
  visites,
  anonymizeProspects = false,
}: RapportVisitesProps) {
  if (visites.length === 0) return null;

  return (
    <section id="visites" className="section-padding bg-luxury-cream scroll-mt-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Sur le terrain</p>
          <h2 className="luxury-subheading text-luxury-charcoal mb-4">
            Visites du mois
          </h2>
          <div className="luxury-divider" />
        </motion.div>

        <div className="space-y-5">
          {visites.map((v, i) => (
            <motion.article
              key={v.id}
              className="bg-white border border-primary-100 rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <div className="grid md:grid-cols-[200px_1fr]">
                <div className="bg-luxury-charcoal text-white p-6 md:p-8 flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-champagne/70 mb-2">
                      Visite du
                    </p>
                    <p className="font-serif text-xl">
                      {v.date ? formatLongDate(v.date) : "—"}
                    </p>
                  </div>
                  {v.workstations && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-champagne/70 mb-1">
                        Postes envisagés
                      </p>
                      <p className="font-serif text-2xl text-luxury-champagne">
                        {v.workstations}
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-6 md:p-8">
                  <div className="mb-4">
                    <h3 className="font-serif text-2xl text-luxury-charcoal">
                      {anonymizeProspects ? `Prospect ${i + 1}` : v.prospect}
                    </h3>
                    {v.activity && (
                      <p className="text-sm text-luxury-slate mt-1">{v.activity}</p>
                    )}
                  </div>
                  {v.feedback && (
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-gold mb-1">
                        Feedback
                      </p>
                      <p className="text-luxury-charcoal leading-relaxed whitespace-pre-line">
                        {v.feedback}
                      </p>
                    </div>
                  )}
                  {v.outcome && (
                    <div className="pt-4 border-t border-primary-100">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-gold mb-1">
                        Suite donnée
                      </p>
                      <p className="text-sm text-luxury-charcoal font-medium">
                        {v.outcome}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
