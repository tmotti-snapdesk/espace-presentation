"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface HighlightProps {
  title: string;
  text: string;
  photos: string[];
}

export default function Highlight({ title, text, photos }: HighlightProps) {
  if (!title && !text) return null;

  const paragraphs = text.split("\n").filter(Boolean);

  return (
    <section className="section-padding bg-luxury-cream">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Le point fort</p>
          <h2 className="luxury-heading text-luxury-charcoal mb-4">
            {title}
          </h2>
          <div className="luxury-divider mx-auto mb-8" />
          <div className="max-w-2xl mx-auto space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-lg text-luxury-slate font-light leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </motion.div>

        {photos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {photos.slice(0, 3).map((photo, i) => (
              <motion.div
                key={photo}
                className={`relative overflow-hidden ${
                  i === 0 && photos.length >= 3 ? "md:col-span-2 md:row-span-2 aspect-square" : "aspect-[4/3]"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <Image
                  src={photo}
                  alt={`${title} - ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes={i === 0 ? "66vw" : "33vw"}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
