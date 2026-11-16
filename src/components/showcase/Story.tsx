"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface StoryProps {
  title: string;
  text: string;
  photos: string[];
}

export default function Story({ title, text, photos }: StoryProps) {
  if (!title && !text) return null;

  const paragraphs = text.split("\n").filter(Boolean);

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="luxury-label mb-4">L&apos;histoire</p>
            <h2 className="luxury-heading text-luxury-charcoal mb-6">
              {title || "Un lieu chargé d'histoire"}
            </h2>
            <div className="luxury-divider mb-8" />
            <div className="space-y-5">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-luxury-slate leading-relaxed font-light text-lg">
                  {p}
                </p>
              ))}
            </div>
          </motion.div>

          {photos.length > 0 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {photos.slice(0, 2).map((photo, i) => (
                <div
                  key={photo}
                  className={`relative overflow-hidden ${i === 0 ? "aspect-[4/3]" : "aspect-[16/9]"}`}
                >
                  <Image
                    src={photo}
                    alt={`${title} - ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="50vw"
                  />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
