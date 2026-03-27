"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface FloorPlanProps {
  floorPlanImage: string;
}

export default function FloorPlan({ floorPlanImage }: FloorPlanProps) {
  if (!floorPlanImage) return null;

  return (
    <section className="section-padding bg-luxury-cream">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Aménagement</p>
          <h2 className="luxury-heading text-luxury-charcoal mb-4">
            Plan de l&apos;espace
          </h2>
          <div className="luxury-divider mx-auto" />
        </motion.div>

        <motion.div
          className="relative w-full max-w-5xl mx-auto"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src={floorPlanImage}
            alt="Plan d'aménagement"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}
