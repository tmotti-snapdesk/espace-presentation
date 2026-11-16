"use client";

import { motion } from "framer-motion";

interface RapportIntroProps {
  intro: string;
}

export default function RapportIntro({ intro }: RapportIntroProps) {
  if (!intro) return null;

  return (
    <section className="px-6 md:px-12 lg:px-24 py-16 md:py-20 bg-luxury-cream">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">En quelques mots</p>
          <div className="luxury-divider mb-8" />
          <div className="font-serif text-xl md:text-2xl text-luxury-charcoal leading-relaxed font-light whitespace-pre-line">
            {intro}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
