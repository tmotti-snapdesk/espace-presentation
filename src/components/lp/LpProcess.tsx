"use client";

import { motion } from "framer-motion";
import { LpProcessStep } from "@/types/lp";

interface LpProcessProps {
  label?: string;
  title?: string;
  subtitle?: string;
  steps?: LpProcessStep[];
}

export default function LpProcess({ label, title, subtitle, steps = [] }: LpProcessProps) {
  const hasContent = !!(label || title || subtitle || steps.length > 0);
  if (!hasContent) return null;

  return (
    <section className="bg-luxury-cream section-padding">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
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

        {steps.length > 0 && (
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.li
                key={i}
                className="relative pl-16"
                initial={{ y: 24, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span className="absolute left-0 top-0 font-serif text-5xl text-luxury-gold leading-none italic">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step.title && (
                  <h3 className="font-serif text-xl text-luxury-charcoal mb-3">
                    {step.title}
                  </h3>
                )}
                {step.text && (
                  <p className="text-sm text-luxury-slate font-light leading-relaxed">
                    {step.text}
                  </p>
                )}
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
