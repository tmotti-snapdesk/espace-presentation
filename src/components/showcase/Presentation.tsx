"use client";

import { motion } from "framer-motion";
import { EspaceData } from "@/types/espace";

interface PresentationProps {
  espace: EspaceData;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function FeatureCard({
  icon,
  label,
  value,
  delay,
}: {
  icon: string;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      className="luxury-card text-center"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
    >
      <span className="text-4xl mb-4 block">{icon}</span>
      <p className="text-2xl font-serif text-luxury-charcoal mb-2">{value}</p>
      <p className="text-sm text-luxury-slate uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

export default function Presentation({ espace }: PresentationProps) {
  const features = [
    { icon: "◻", label: "Open Spaces", value: `${espace.openSpaces}` },
    { icon: "▣", label: "Salles de réunion", value: `${espace.meetingRooms}` },
    ...(espace.hasLunchArea
      ? [{ icon: "◈", label: "Espace déjeuner", value: "Inclus" }]
      : []),
    ...(espace.hasEquippedKitchen
      ? [{ icon: "◇", label: "Cuisine équipée", value: "Incluse" }]
      : []),
  ];

  return (
    <section className="section-padding bg-luxury-cream">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">L&apos;espace</p>
          <h2 className="luxury-heading text-luxury-charcoal mb-6">
            Un lieu d&apos;exception
          </h2>
          <div className="luxury-divider mx-auto mb-8" />
          {espace.tagline && (
            <p className="text-lg text-luxury-slate max-w-2xl mx-auto font-light leading-relaxed">
              {espace.tagline}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {features.map((feature, i) => (
            <FeatureCard key={feature.label} {...feature} delay={i * 0.1} />
          ))}
        </div>

        {espace.amenities.length > 0 && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="luxury-label mb-6">Équipements & Services</p>
            <div className="flex flex-wrap justify-center gap-4">
              {espace.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="px-6 py-3 border border-primary-200 text-sm text-luxury-slate tracking-wide"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
