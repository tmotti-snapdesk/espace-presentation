"use client";

import { motion } from "framer-motion";

interface LpAnchorCtaProps {
  text: string;
}

export default function LpAnchorCta({ text }: LpAnchorCtaProps) {
  if (!text) return null;
  return (
    <div className="bg-white py-8 px-6 text-center">
      <motion.a
        href="#form"
        className="luxury-btn"
        initial={{ y: 12, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4 }}
      >
        {text}
      </motion.a>
    </div>
  );
}
