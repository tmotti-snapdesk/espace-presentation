"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface BrokerGalleryProps {
  photos: string[];
  name: string;
}

function downloadName(name: string, index: number, url: string) {
  const ext = url.split(".").pop()?.split("?")[0] || "jpg";
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${index + 1}.${ext}`;
}

export default function BrokerGallery({ photos, name }: BrokerGalleryProps) {
  if (!photos || photos.length === 0) return null;

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Photos</p>
          <h2 className="luxury-heading text-luxury-charcoal mb-4">
            Galerie
          </h2>
          <div className="luxury-divider mx-auto mb-4" />
          <p className="text-sm text-luxury-slate">
            Survolez une photo pour la télécharger.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo}
              className="relative aspect-[4/3] overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Image
                src={photo}
                alt={`${name} - Photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="33vw"
              />
              <a
                href={photo}
                download={downloadName(name, index, photo)}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-luxury-charcoal/0 group-hover:bg-luxury-charcoal/50 transition-colors"
                aria-label={`Télécharger la photo ${index + 1}`}
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-2 px-4 py-2 bg-white text-luxury-charcoal text-xs uppercase tracking-[0.15em] font-medium rounded">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Télécharger
                </span>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
