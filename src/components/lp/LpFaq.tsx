"use client";

import { motion } from "framer-motion";
import { LpFaqItem } from "@/types/lp";

interface LpFaqProps {
  label?: string;
  title?: string;
  subtitle?: string;
  items?: LpFaqItem[];
}

export default function LpFaq({ label, title, subtitle, items = [] }: LpFaqProps) {
  const visibleItems = items.filter((it) => it.question);
  const hasContent = !!(label || title || subtitle || visibleItems.length > 0);
  if (!hasContent) return null;

  return (
    <section className="bg-white section-padding">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          {label && <p className="luxury-label mb-4">{label}</p>}
          {title && (
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
            <p className="text-luxury-slate font-light max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          <div className="luxury-divider mx-auto mt-6" />
        </div>

        {visibleItems.length > 0 && (
          <div className="divide-y divide-primary-100 border-y border-primary-100">
            {visibleItems.map((item, i) => (
              <details key={i} className="group py-5 px-2">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="font-serif text-base md:text-lg text-luxury-charcoal pr-4">
                    {item.question}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 text-luxury-gold text-xl leading-none transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                {item.answer && (
                  <div className="mt-4 text-sm md:text-base text-luxury-slate font-light leading-relaxed whitespace-pre-line">
                    {item.answer}
                  </div>
                )}
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
