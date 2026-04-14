"use client";

import { motion } from "framer-motion";
import { LpLogo } from "@/types/lp";

interface LpSocialProofProps {
  title?: string;
  logos?: LpLogo[];
}

export default function LpSocialProof({ title, logos = [] }: LpSocialProofProps) {
  if (!title && logos.length === 0) return null;

  return (
    <section className="bg-luxury-cream section-padding">
      <div className="max-w-5xl mx-auto">
        {/* DEBUG — temporary: shows what the component receives */}
        <p className="text-xs text-red-500 text-center mb-4">
          DEBUG: {logos.length} logo(s) reçus par le composant
        </p>

        {title && (
          <p className="luxury-label text-center mb-12">{title}</p>
        )}

        {logos.length > 0 && (
          // Motion only shifts `y` — logos are always rendered at full
          // opacity so a missed IntersectionObserver can't hide them.
          <motion.div
            className="flex flex-wrap items-center justify-center gap-10 md:gap-16"
            initial={{ y: 16 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
          >
            {logos.map((logo, i) => (
              // DEBUG — red border so we can see the box even if image fails.
              <div key={i} className="border-2 border-red-500 p-2 bg-yellow-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.url}
                  alt={logo.alt || ""}
                  className="h-12 w-auto max-w-[160px] object-contain"
                />
                <p className="text-[10px] text-red-500 break-all max-w-[160px]">
                  {logo.url}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
