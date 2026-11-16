"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LpStickyCtaProps {
  text: string;
}

export default function LpStickyCta({ text }: LpStickyCtaProps) {
  const [scrolledPast, setScrolledPast] = useState(false);
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const formEl = document.getElementById("form");
    if (!formEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(formEl);
    return () => observer.disconnect();
  }, []);

  const visible = scrolledPast && !formInView;

  if (!text) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-4 inset-x-4 md:left-auto md:right-6 md:bottom-6 md:inset-x-auto z-40"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <a
            href="#form"
            className="block w-full md:w-auto px-6 py-4 bg-luxury-gold text-luxury-charcoal text-center text-sm uppercase tracking-[0.15em] font-medium shadow-lg hover:bg-luxury-champagne transition-colors"
          >
            {text}
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
