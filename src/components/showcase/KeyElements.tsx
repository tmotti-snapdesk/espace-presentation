"use client";

import { motion } from "framer-motion";
import { EspaceData } from "@/types/espace";

interface KeyElementsProps {
  espace: EspaceData;
}

export default function KeyElements({ espace }: KeyElementsProps) {
  const elements = [
    { label: "Postes de travail", value: `${espace.workstations}` },
    { label: "Disponibilité", value: espace.availability },
    { label: "Loyer mensuel", value: espace.pricePerMonth },
    { label: "Durée d'engagement", value: espace.leaseDuration },
    { label: "Préavis de départ", value: espace.noticePeriod },
  ];

  return (
    <section className="section-padding bg-luxury-cream text-luxury-charcoal">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Conditions</p>
          <h2 className="luxury-heading mb-4">Éléments clés</h2>
          <div className="luxury-divider mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {elements.map((el, i) => (
            <motion.div
              key={el.label}
              className="bg-white rounded-lg p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-3xl md:text-4xl font-serif text-luxury-champagne mb-3">
                {el.value}
              </p>
              <p className="text-xs font-medium uppercase tracking-[2px] text-luxury-charcoal/70">
                {el.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
