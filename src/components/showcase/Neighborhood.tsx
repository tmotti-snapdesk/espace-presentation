"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface NeighborhoodProps {
  title: string;
  text: string;
  photos: string[];
}

export default function Neighborhood({ title, text, photos }: NeighborhoodProps) {
  if (!title && !text) return null;

  const paragraphs = text.split("\n").filter(Boolean);

  return (
    <section className="section-padding bg-luxury-cream">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {photos.length > 0 && (
            <motion.div
              className="space-y-4 order-2 lg:order-1"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {photos.slice(0, 3).map((photo, i) => (
                <div
                  key={photo}
                  className={`relative overflow-hidden ${i === 0 ? "aspect-[16/10]" : "aspect-[16/9]"}`}
                >
                  <Image
                    src={photo}
                    alt={`Quartier - ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="50vw"
                  />
                </div>
              ))}
            </motion.div>
          )}

          <motion.div
            className={`order-1 lg:order-2 ${photos.length === 0 ? "lg:col-span-2 max-w-2xl mx-auto text-center" : ""}`}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="luxury-label mb-4">Le quartier</p>
            <h2 className="luxury-heading text-luxury-charcoal mb-6">
              {title || "Un emplacement privilégié"}
            </h2>
            <div className={`luxury-divider mb-8 ${photos.length === 0 ? "mx-auto" : ""}`} />
            <div className="space-y-5">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-luxury-slate leading-relaxed font-light text-lg">
                  {p}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
