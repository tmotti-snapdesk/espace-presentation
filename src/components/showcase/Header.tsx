"use client";

import { motion } from "framer-motion";
import { EspaceData } from "@/types/espace";

interface HeaderProps {
  espace: EspaceData;
}

export default function Header({ espace }: HeaderProps) {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={espace.videoUrl} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 video-overlay" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-20 px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <p className="luxury-label text-luxury-champagne mb-4">Snapdesk présente</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium text-white mb-8 tracking-tight">
            {espace.name}
          </h1>
          <div className="flex flex-wrap gap-8 md:gap-16 text-white/90">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-luxury-champagne/70 mb-1">
                Postes
              </p>
              <p className="text-2xl md:text-3xl font-serif">{espace.workstations}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-luxury-champagne/70 mb-1">
                Localisation
              </p>
              <p className="text-2xl md:text-3xl font-serif">{espace.city}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-luxury-champagne/70 mb-1">
                Disponibilité
              </p>
              <p className="text-2xl md:text-3xl font-serif">{espace.availability}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-[1px] h-12 bg-white/40" />
      </motion.div>
    </section>
  );
}
