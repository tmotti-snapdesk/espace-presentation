"use client";

import { motion } from "framer-motion";

interface RapportUpcomingProps {
  upcomingActions: string[];
}

export default function RapportUpcoming({ upcomingActions }: RapportUpcomingProps) {
  if (upcomingActions.length === 0) return null;

  return (
    <section
      id="actions-a-venir"
      className="section-padding bg-white scroll-mt-8"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Le mois prochain</p>
          <h2 className="luxury-subheading text-luxury-charcoal mb-4">
            Actions à venir
          </h2>
          <div className="luxury-divider" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {upcomingActions.map((action, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-4 p-5 border border-luxury-gold/30 rounded-lg bg-luxury-champagne/20"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-luxury-gold/15 text-luxury-gold flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <p className="text-luxury-charcoal leading-relaxed pt-1">{action}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
