"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface LpHeroProps {
  videoUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
}

export default function LpHero({ videoUrl, title, subtitle, ctaText }: LpHeroProps) {
  const scrollToForm = () => {
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video / fallback background */}
      {videoUrl ? (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <div className="absolute inset-0 bg-luxury-charcoal" />
      )}

      {/* Gray tint layer for improved text contrast */}
      <div className="absolute inset-0 bg-gray-900/25" />

      {/* Overlay */}
      <div className="video-overlay absolute inset-0" />

      {/* Logo top-left */}
      <motion.div
        className="absolute top-8 left-6 md:left-12 lg:left-24 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/images/Logo Snapdesk Blanc.png"
          alt="Snapdesk"
          width={160}
          height={40}
          className="h-8 md:h-10 w-auto"
          priority
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
        <motion.p
          className="luxury-label text-luxury-gold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Snapdesk
        </motion.p>

        <motion.h1
          className="luxury-heading text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            className="text-lg md:text-xl text-white/80 font-light mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}

        <motion.button
          onClick={scrollToForm}
          className="luxury-btn-outline border-white text-white hover:bg-white hover:text-luxury-charcoal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {ctaText}
        </motion.button>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <motion.div
            className="w-[1px] h-12 bg-white/40 mx-auto"
            animate={{ scaleY: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
