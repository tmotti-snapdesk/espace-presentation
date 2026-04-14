"use client";

import { motion } from "framer-motion";
import { LpLogo } from "@/types/lp";

interface LpSocialProofProps {
  title?: string;
  logos?: LpLogo[];
}

export default function LpSocialProof({ title, logos = [] }: LpSocialProofProps) {
  // Defensive: tolerate a non-array payload (legacy / corrupted JSON) and
  // ignore any entry without a usable URL so the section never crashes
  // and never renders a broken <img>.
  const safeLogos = (Array.isArray(logos) ? logos : []).filter(
    (l): l is LpLogo => Boolean(l && typeof l.url === "string" && l.url.trim())
  );

  if (!title && safeLogos.length === 0) return null;

  return (
    <section className="bg-luxury-cream section-padding">
      <div className="max-w-5xl mx-auto">
        {title && (
          <p className="luxury-label text-center mb-12">{title}</p>
        )}

        {safeLogos.length > 0 && (
          // Motion only shifts `y` — logos stay at full opacity so a
          // missed IntersectionObserver can't hide them.
          <motion.div
            className="flex flex-wrap items-center justify-center gap-10 md:gap-16"
            initial={{ y: 16 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
          >
            {safeLogos.map((logo, i) => (
              // Plain <img> — next/image with `fill` was unreliable for
              // Blob-hosted logos with varying aspect ratios. Since
              // unoptimized: true is set globally, there is no perf loss.
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
