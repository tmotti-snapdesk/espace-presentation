"use client";

import { motion } from "framer-motion";

interface RapportProspectionProps {
  prospectionActions: string[];
}

export default function RapportProspection({ prospectionActions }: RapportProspectionProps) {
  if (prospectionActions.length === 0) return null;

  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Commerciale</p>
          <h2 className="luxury-subheading text-luxury-charcoal mb-4">
            Prospection menée ce mois-ci
          </h2>
          <div className="luxury-divider" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {prospectionActions.map((action, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-4 p-5 border border-primary-100 rounded-lg bg-luxury-cream/40"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-luxury-charcoal text-luxury-champagne flex items-center justify-center font-serif text-sm">
                {i + 1}
              </div>
              <p className="text-luxury-charcoal leading-relaxed pt-0.5">{action}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
