"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface PhotoGalleryProps {
  photos: string[];
  name: string;
}

export default function PhotoGallery({ photos, name }: PhotoGalleryProps) {
  if (!photos || photos.length === 0) return null;

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Galerie</p>
          <h2 className="luxury-heading text-luxury-charcoal mb-4">
            Découvrez {name}
          </h2>
          <div className="luxury-divider mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {photos.map((photo, index) => {
            const isLarge = index === 0 || index === 3;
            return (
              <motion.div
                key={photo}
                className={`relative overflow-hidden ${
                  isLarge ? "md:col-span-2 aspect-[21/9]" : "aspect-[4/3]"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Image
                  src={photo}
                  alt={`${name} - Photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes={isLarge ? "100vw" : "50vw"}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
