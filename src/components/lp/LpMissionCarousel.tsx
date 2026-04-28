"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface LpMissionCarouselProps {
  photos: string[];
  intervalMs?: number;
}

export default function LpMissionCarousel({ photos, intervalMs = 4000 }: LpMissionCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || photos.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [photos.length, intervalMs, paused]);

  if (!photos.length) return null;

  const safeIndex = ((index % photos.length) + photos.length) % photos.length;

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-primary-50">
        <AnimatePresence>
          <motion.div
            key={safeIndex}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <Image
              src={photos[safeIndex]}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority={safeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 transition-all ${
                i === safeIndex ? "w-8 bg-luxury-gold" : "w-4 bg-primary-200 hover:bg-primary-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
