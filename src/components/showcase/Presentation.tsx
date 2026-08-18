"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid,
  Presentation as PresentationIcon,
  UtensilsCrossed,
  ChefHat,
  Fence,
  Umbrella,
  Snowflake,
  Bike,
  Check,
  type LucideIcon,
} from "lucide-react";
import { EspaceData } from "@/types/espace";

interface PresentationProps {
  espace: EspaceData;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function FeatureCard({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: LucideIcon;
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
      <Icon className="w-7 h-7 mx-auto mb-4 text-luxury-charcoal" strokeWidth={1.25} />
      <p className="text-2xl font-serif text-luxury-charcoal mb-2">{value}</p>
      <p className="text-sm text-luxury-slate uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

export default function Presentation({ espace }: PresentationProps) {
  const features = [
    { icon: LayoutGrid, label: "Open Spaces", value: `${espace.openSpaces}` },
    { icon: PresentationIcon, label: "Salles de réunion", value: `${espace.meetingRooms}` },
    ...(espace.hasLunchArea
      ? [{ icon: UtensilsCrossed, label: "Espace déjeuner", value: "Inclus" }]
      : []),
    ...(espace.hasEquippedKitchen
      ? [{ icon: ChefHat, label: "Cuisine équipée", value: "Incluse" }]
      : []),
    ...(espace.hasBalconFilant
      ? [{ icon: Fence, label: "Balcon filant", value: "Inclus" }]
      : []),
    ...(espace.hasTerrace
      ? [{ icon: Umbrella, label: "Terrasse", value: "Incluse" }]
      : []),
    ...(espace.hasAirConditioning
      ? [{ icon: Snowflake, label: "Climatisation", value: "Incluse" }]
      : []),
    ...(espace.hasBikeRack
      ? [{ icon: Bike, label: "Rack à vélos", value: "Inclus" }]
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
            <div className="text-lg text-luxury-slate max-w-2xl mx-auto font-light leading-relaxed space-y-4">
              {espace.tagline.split("\n").filter(Boolean).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
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
                  className="inline-flex items-center gap-2 px-6 py-3 border border-primary-200 text-sm text-luxury-slate tracking-wide"
                >
                  <Check className="w-3.5 h-3.5 text-luxury-gold shrink-0" strokeWidth={2} />
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
