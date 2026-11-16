"use client";

import { motion } from "framer-motion";

interface BuildingStatsProps {
  surface: string;
  floors: string;
  year: string;
  certification: string;
}

export default function BuildingStats({ surface, floors, year, certification }: BuildingStatsProps) {
  const stats = [
    { label: "Surface totale", value: surface },
    { label: "Étages", value: floors },
    { label: "Année", value: year },
    { label: "Certification", value: certification },
  ].filter((s) => s.value);

  if (stats.length === 0) return null;

  return (
    <section className="py-16 bg-luxury-charcoal">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className={`grid grid-cols-2 md:grid-cols-${stats.length} gap-px bg-white/10`}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-luxury-charcoal py-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-3xl md:text-4xl font-serif text-luxury-champagne mb-3">
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
