"use client";

import { motion } from "framer-motion";

interface RapportRecommendationsProps {
  recommendations: string[];
}

export default function RapportRecommendations({
  recommendations,
}: RapportRecommendationsProps) {
  if (recommendations.length === 0) return null;

  return (
    <section className="section-padding bg-luxury-charcoal text-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Notre lecture</p>
          <h2 className="luxury-subheading mb-4">Nos préconisations</h2>
          <div className="luxury-divider" />
        </motion.div>

        <ol className="space-y-5">
          {recommendations.map((reco, i) => (
            <motion.li
              key={i}
              className="flex gap-6 p-6 border border-white/10 bg-white/5 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <span className="font-serif text-3xl md:text-4xl text-luxury-gold leading-none shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-white/90 text-base md:text-lg leading-relaxed font-light whitespace-pre-line">
                {reco}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
