"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface LpTestimonialProps {
  quote?: string;
  authorName?: string;
  authorCompany?: string;
  authorRole?: string;
  authorPhoto?: string;
}

export default function LpTestimonial({
  quote,
  authorName,
  authorCompany,
  authorRole,
  authorPhoto,
}: LpTestimonialProps) {
  if (!quote) return null;

  // Compose the attribution line from whichever fields are provided, e.g.
  // "Jane Doe, CEO — Acme". Each segment is rendered only if present so
  // an empty field never yields stray punctuation.
  const nameAndRole = [authorName, authorRole].filter(Boolean).join(", ");
  const attribution = [nameAndRole, authorCompany].filter(Boolean).join(" — ");

  return (
    <section className="bg-white section-padding">
      <div className="max-w-3xl mx-auto text-center">
        {authorPhoto && (
          <motion.div
            className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-8 rounded-full overflow-hidden ring-1 ring-luxury-gold/40"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={authorPhoto}
              alt={authorName || ""}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 96px, 80px"
            />
          </motion.div>
        )}

        <div
          aria-hidden
          className="font-serif text-4xl md:text-5xl text-luxury-gold leading-none mb-4"
        >
          &ldquo;
        </div>

        <motion.blockquote
          className="font-serif italic text-lg md:text-xl text-luxury-charcoal leading-relaxed"
          initial={{ y: 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
        >
          {quote}
        </motion.blockquote>

        {attribution && (
          <>
            <div className="luxury-divider mx-auto mt-8 mb-5" />
            <p className="luxury-label text-luxury-slate">{attribution}</p>
          </>
        )}
      </div>
    </section>
  );
}
