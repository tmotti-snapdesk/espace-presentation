"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { EspaceData } from "@/types/espace";

interface EspaceDirectoryCardProps {
  espace: EspaceData;
}

const SLIDE_INTERVAL_MS = 4000;

export default function EspaceDirectoryCard({ espace }: EspaceDirectoryCardProps) {
  const photos = espace.photos || [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [photos.length]);

  return (
    <Link
      href={`/espaces/${espace.slug}/fiche`}
      className="group relative block aspect-[4/3] overflow-hidden bg-luxury-charcoal rounded-lg"
    >
      {photos.length > 0 ? (
        <AnimatePresence initial={false}>
          <motion.div
            key={photos[index]}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Image
              src={photos[index]}
              alt={espace.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #c5a572 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal/90 via-luxury-charcoal/10 to-transparent" />

      {photos.length > 1 && (
        <div className="absolute top-4 right-4 flex gap-1.5 z-10">
          {photos.map((photo, i) => (
            <span
              key={photo}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === index ? "bg-luxury-champagne" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6 z-10">
        <p className="luxury-label text-luxury-champagne mb-1">{espace.city}</p>
        <h3 className="font-serif text-2xl text-white mb-3 leading-tight">
          {espace.name}
        </h3>
        <div className="flex items-center gap-4 text-white/80 text-sm">
          <span>{espace.workstations} postes</span>
          {espace.pricePerMonth && (
            <>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span>{espace.pricePerMonth}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
