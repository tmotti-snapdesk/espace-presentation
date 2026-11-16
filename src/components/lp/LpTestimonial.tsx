"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { LpTestimonialItem } from "@/types/lp";

interface LpTestimonialProps {
  items?: LpTestimonialItem[];
}

export default function LpTestimonial({ items }: LpTestimonialProps) {
  const safeItems = (Array.isArray(items) ? items : []).filter(
    (it): it is LpTestimonialItem => Boolean(it && typeof it.quote === "string" && it.quote.trim())
  );

  const [index, setIndex] = useState(0);

  // Auto-advance only when there's more than one testimonial. Pauses while
  // the tab is hidden so we don't churn through items in the background.
  useEffect(() => {
    if (safeItems.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % safeItems.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [safeItems.length]);

  // Clamp the index when the items list shrinks (e.g. last one removed).
  useEffect(() => {
    if (index >= safeItems.length) setIndex(0);
  }, [index, safeItems.length]);

  if (safeItems.length === 0) return null;

  const current = safeItems[index];
  const hasMultiple = safeItems.length > 1;
  const goTo = (i: number) => setIndex(((i % safeItems.length) + safeItems.length) % safeItems.length);

  return (
    <section className="bg-white section-padding">
      <div className="max-w-3xl mx-auto px-6">
        <div className="relative">
          <div
            aria-hidden
            className="font-serif text-4xl md:text-5xl text-luxury-gold leading-none mb-4 text-center"
          >
            &ldquo;
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <TestimonialCard item={current} />
            </motion.div>
          </AnimatePresence>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Témoignage précédent"
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 items-center justify-center rounded-full border border-primary-200 bg-white text-luxury-charcoal hover:border-luxury-gold hover:text-luxury-gold transition-colors"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Témoignage suivant"
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 items-center justify-center rounded-full border border-primary-200 bg-white text-luxury-charcoal hover:border-luxury-gold hover:text-luxury-gold transition-colors"
              >
                ›
              </button>
            </>
          )}
        </div>

        {hasMultiple && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {safeItems.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Aller au témoignage ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-8 bg-luxury-gold" : "w-1.5 bg-luxury-slate/30 hover:bg-luxury-slate/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialCard({ item }: { item: LpTestimonialItem }) {
  const nameAndRole = [item.authorName, item.authorRole].filter(Boolean).join(", ");
  const attribution = [nameAndRole, item.authorCompany].filter(Boolean).join(" — ");

  return (
    <>
      <blockquote className="font-serif italic text-lg md:text-xl text-luxury-charcoal leading-relaxed">
        {item.quote}
      </blockquote>

      {attribution && (
        <>
          <div className="luxury-divider mx-auto mt-8 mb-5" />
          <p className="luxury-label text-luxury-slate">{attribution}</p>
        </>
      )}

      {item.authorPhoto && (
        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mt-6 rounded-full overflow-hidden ring-1 ring-luxury-gold/40">
          <Image
            src={item.authorPhoto}
            alt={item.authorName || ""}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 96px, 80px"
          />
        </div>
      )}
    </>
  );
}
