"use client";

import { motion } from "framer-motion";
import { EspaceData } from "@/types/espace";

interface LocationProps {
  espace: EspaceData;
}

export default function Location({ espace }: LocationProps) {
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
    `${espace.address}, ${espace.postalCode} ${espace.city}`
  )}&zoom=15&maptype=roadmap`;

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Localisation</p>
          <h2 className="luxury-heading text-luxury-charcoal mb-4">
            Au cœur de {espace.city}
          </h2>
          <div className="luxury-divider mx-auto mb-6" />
          <p className="text-lg text-luxury-slate font-light">
            {espace.address}, {espace.postalCode} {espace.city}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map */}
          <motion.div
            className="lg:col-span-2 aspect-[16/10] map-container"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation de l'espace"
            />
          </motion.div>

          {/* Transport */}
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="luxury-label mb-6">Transports à proximité</p>
            <div className="space-y-5">
              {espace.metroStations.map((station) => {
                const lines = (station.lines || (station as unknown as Record<string, string>).line || "")
                  .split(",")
                  .map((l: string) => l.trim())
                  .filter(Boolean);
                return (
                  <div
                    key={`${station.name}-${station.lines}`}
                    className="flex items-center gap-4 pb-5 border-b border-primary-100 last:border-0"
                  >
                    <div className="flex gap-2 shrink-0">
                      {lines.map((line) => (
                        <div
                          key={line}
                          className="w-10 h-10 rounded-full bg-luxury-charcoal text-white flex items-center justify-center text-sm font-medium"
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-medium text-luxury-charcoal">
                        {station.name}
                      </p>
                      <p className="text-sm text-luxury-slate">{station.distance}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
