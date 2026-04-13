"use client";

import { motion } from "framer-motion";
import { LpLogo } from "@/types/lp";
import Image from "next/image";

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
              <div
                key={i}
                className="relative h-8 w-28 opacity-50 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-300"
              >
                <Image
                  src={logo.url}
                  alt={logo.alt || ""}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
