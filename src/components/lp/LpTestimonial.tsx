"use client";

import { motion } from "framer-motion";

interface LpTestimonialProps {
  quote?: string;
  authorName?: string;
  authorCompany?: string;
  authorRole?: string;
}

export default function LpTestimonial({
  quote,
  authorName,
  authorCompany,
  authorRole,
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
