"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { LpMissionCard } from "@/types/lp";
import LpMissionCarousel from "./LpMissionCarousel";

interface LpMissionProps {
  label?: string;
  title?: string;
  subtitle?: string;
  cards?: LpMissionCard[];
  photos?: string[];
}

export default function LpMission({ label, title, subtitle, cards = [], photos = [] }: LpMissionProps) {
  // Render as soon as any content is present. Previously the section
  // was hidden when only label/subtitle/cards were provided without a
  // title — which matched the original bug report.
  const hasContent = !!(label || title || subtitle || cards.length > 0 || photos.length > 0);
  if (!hasContent) return null;

  const hasPhotos = photos.length > 0;
  // When the carousel is shown we shrink the cards grid into the left
  // column, so they stack 2-by-2 on desktop instead of fanning across
  // the full width.
  const cardsGridClass = hasPhotos
    ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";

  const cardsBlock = cards.length > 0 && (
    <div className={cardsGridClass}>
      {cards.map((card, i) => (
        <motion.div
          key={i}
          className="luxury-card text-center"
          initial={{ y: 24 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          {card.iconImage ? (
            <div className="relative h-12 w-12 mx-auto mb-4">
              <Image
                src={card.iconImage}
                alt={card.title || ""}
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
          ) : card.icon ? (
            <div className="text-4xl mb-4">{card.icon}</div>
          ) : null}
          <h3 className="font-serif text-lg text-luxury-charcoal mb-3">
            {card.title}
          </h3>
          {card.text && (
            <p className="text-sm text-luxury-slate font-light leading-relaxed">
              {card.text}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );

  return (
    <section className="bg-white section-padding">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
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
            <p className="text-luxury-slate font-light max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
          <div className="luxury-divider mx-auto mt-6" />
        </div>

        {hasPhotos ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>{cardsBlock}</div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6 }}
            >
              <LpMissionCarousel photos={photos} />
            </motion.div>
          </div>
        ) : (
          cardsBlock
        )}
      </div>
    </section>
  );
}
