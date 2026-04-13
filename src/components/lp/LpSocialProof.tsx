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
        {title && (
          <motion.p
            className="luxury-label text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.p>
        )}

        {logos.length > 0 && (
          <motion.div
            className="flex flex-wrap items-center justify-center gap-10 md:gap-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {logos.map((logo, i) => (
              // Plain <img> — next/image with `fill` was silently hiding
              // logos when URLs had edge cases. Blob assets are already
              // served via CDN and `unoptimized: true` is set globally,
              // so there is no perf loss compared to next/image here.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={logo.url}
                alt={logo.alt || ""}
                className="h-10 md:h-12 w-auto max-w-[160px] object-contain opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
