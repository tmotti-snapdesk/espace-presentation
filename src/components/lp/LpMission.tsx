"use client";

import { motion } from "framer-motion";
import { LpMissionCard } from "@/types/lp";

interface LpMissionProps {
  label?: string;
  title?: string;
  subtitle?: string;
  cards?: LpMissionCard[];
}

export default function LpMission({ label, title, subtitle, cards = [] }: LpMissionProps) {
  if (!title && cards.length === 0) return null;

  return (
    <section className="bg-white section-padding">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          {label && <p className="luxury-label mb-4">{label}</p>}
          {title && (
            <motion.h2
              className="luxury-subheading text-luxury-charcoal mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p
              className="text-luxury-slate font-light max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
          <div className="luxury-divider mx-auto mt-6" />
        </div>

        {/* Cards grid */}
        {cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                className="luxury-card text-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {card.icon && (
                  <div className="text-4xl mb-4">{card.icon}</div>
                )}
                <h3 className="font-serif text-lg text-luxury-charcoal mb-3">
                  {card.title}
                </h3>
                {card.text && (
                  <p className="text-sm text-luxury-slate font-light leading-relaxed">
                    {card.text}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
