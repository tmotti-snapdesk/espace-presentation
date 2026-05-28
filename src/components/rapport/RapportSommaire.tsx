"use client";

import { motion } from "framer-motion";

interface SommaireItem {
  id: string;
  label: string;
}

interface RapportSommaireProps {
  items: SommaireItem[];
}

export default function RapportSommaire({ items }: RapportSommaireProps) {
  if (items.length === 0) return null;

  return (
    <section className="bg-luxury-cream border-b border-primary-100">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center gap-6"
        >
          <p className="luxury-label shrink-0">Sommaire</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {items.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group inline-flex items-baseline gap-2 text-sm text-luxury-charcoal hover:text-luxury-gold transition-colors"
              >
                <span className="font-serif text-luxury-gold text-xs">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="border-b border-transparent group-hover:border-luxury-gold transition-colors pb-0.5">
                  {item.label}
                </span>
              </a>
            ))}
          </nav>
        </motion.div>
      </div>
    </section>
  );
}
