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
  // Render as soon as any content is present. Previously the section
  // was hidden when only label/subtitle/cards were provided without a
  // title — which matched the original bug report.
  const hasContent = !!(label || title || subtitle || cards.length > 0);
  if (!hasContent) return null;

  return (
    <section className="bg-white section-padding">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          {label && <p className="luxury-label mb-4">{label}</p>}
          {title && (
            // Only `y` animates — opacity stays at 1, so the content
            // is never invisible if IntersectionObserver misfires.
            <motion.h2
              className="luxury-subheading text-luxury-charcoal mb-4"
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6 }}
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <p className="text-luxury-slate font-light max-w-xl mx-auto">
              {subtitle}
            </p>
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
                initial={{ y: 24 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
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
