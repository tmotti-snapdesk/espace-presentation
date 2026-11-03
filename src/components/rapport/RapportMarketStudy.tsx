"use client";

import { motion } from "framer-motion";
import { MarketStudyFigure } from "@/types/rapport";

interface RapportMarketStudyProps {
  summary: string;
  figures: MarketStudyFigure[];
}

export default function RapportMarketStudy({ summary, figures }: RapportMarketStudyProps) {
  if (!summary && figures.length === 0) return null;

  return (
    <section id="etude-marche" className="section-padding bg-white scroll-mt-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Le marché</p>
          <h2 className="luxury-subheading text-luxury-charcoal mb-4">Étude de marché</h2>
          <div className="luxury-divider" />
        </motion.div>

        {figures.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {figures.map((figure, i) => (
              <motion.div
                key={figure.id}
                className="p-6 md:p-8 rounded-lg border border-primary-100 bg-luxury-cream"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-luxury-slate mb-3 leading-snug">
                  {figure.label}
                </p>
                <p className="font-serif text-3xl md:text-4xl text-luxury-charcoal">
                  {figure.value || "—"}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {summary && (
          <motion.p
            className="max-w-4xl text-luxury-charcoal text-base md:text-lg leading-relaxed font-light whitespace-pre-line"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {summary}
          </motion.p>
        )}
      </div>
    </section>
  );
}
