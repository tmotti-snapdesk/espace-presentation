"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { EspaceData } from "@/types/espace";
import BrokerGallery from "@/components/showcase/BrokerGallery";

interface FicheBrokerPageProps {
  espace: EspaceData;
  presentationUrl: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function FicheBrokerPage({ espace, presentationUrl }: FicheBrokerPageProps) {
  const keyFacts = [
    { label: "Postes de travail", value: `${espace.workstations}` },
    { label: "Open spaces", value: `${espace.openSpaces}` },
    { label: "Salles de réunion", value: `${espace.meetingRooms}` },
    { label: "Disponibilité", value: espace.availability },
    { label: "Loyer mensuel", value: espace.pricePerMonth },
    { label: "Durée d'engagement", value: espace.leaseDuration },
    { label: "Préavis de départ", value: espace.noticePeriod },
  ].filter((fact) => fact.value);

  return (
    <main className="min-h-screen bg-luxury-cream">
      {/* Hero */}
      <section className="bg-luxury-charcoal text-white section-padding !pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.7 }}>
            <Image
              src="/images/Logo Snapdesk Blanc.png"
              alt="Snapdesk"
              width={160}
              height={40}
              className="h-8 md:h-10 w-auto mb-10"
              priority
            />
            <p className="luxury-label text-luxury-champagne mb-3">Fiche broker</p>
            <h1 className="font-serif text-4xl md:text-6xl font-medium mb-4 tracking-tight">
              {espace.name}
            </h1>
            <p className="text-white/70 text-lg font-light mb-8">
              {espace.address}, {espace.postalCode} {espace.city}
            </p>

            <div className="flex flex-wrap gap-4">
              {presentationUrl && (
                <a
                  href={presentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-luxury-champagne text-luxury-charcoal text-sm uppercase tracking-[0.15em] font-medium rounded hover:bg-white transition-colors"
                >
                  Voir la présentation commerciale
                </a>
              )}
              <a
                href={`/espaces/${espace.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 border border-white/30 text-white/90 text-sm uppercase tracking-[0.15em] font-medium rounded hover:bg-white/10 transition-colors"
              >
                Voir le mini-site complet
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key facts */}
      {keyFacts.length > 0 && (
        <section className="section-padding !py-16 bg-white">
          <div className="max-w-5xl mx-auto">
            <p className="luxury-label mb-8 text-center">Éléments clés</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-primary-100 border border-primary-100">
              {keyFacts.map((fact, i) => (
                <motion.div
                  key={fact.label}
                  className="bg-white p-6 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <p className="text-xl md:text-2xl font-serif text-luxury-charcoal mb-2">
                    {fact.value}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-luxury-slate">
                    {fact.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Amenities & metro */}
      {(espace.amenities.length > 0 || espace.metroStations.length > 0) && (
        <section className="section-padding !py-16 bg-luxury-cream">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            {espace.amenities.length > 0 && (
              <div>
                <p className="luxury-label mb-4">Équipements & services</p>
                <div className="flex flex-wrap gap-3">
                  {espace.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-4 py-2 bg-white border border-primary-200 text-sm text-luxury-slate rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {espace.metroStations.length > 0 && (
              <div>
                <p className="luxury-label mb-4">Transports à proximité</p>
                <div className="space-y-3">
                  {espace.metroStations.map((station) => (
                    <div
                      key={`${station.name}-${station.lines}`}
                      className="flex items-center justify-between text-sm border-b border-primary-100 pb-3"
                    >
                      <span className="text-luxury-charcoal font-medium">
                        {station.name} {station.lines && `(${station.lines})`}
                      </span>
                      <span className="text-luxury-slate">{station.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Photos */}
      <BrokerGallery photos={espace.photos} name={espace.name} />

      {/* Floor plan */}
      {espace.floorPlanImage && (
        <section className="section-padding !py-16 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <p className="luxury-label mb-4">Plan d&apos;aménagement</p>
            <a
              href={espace.floorPlanImage}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block relative w-full aspect-[4/3] bg-primary-50 rounded overflow-hidden mb-4"
            >
              <Image
                src={espace.floorPlanImage}
                alt={`Plan de ${espace.name}`}
                fill
                className="object-contain"
                sizes="800px"
              />
            </a>
            <a
              href={espace.floorPlanImage}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-luxury-gold hover:text-luxury-charcoal transition-colors"
            >
              Télécharger le plan &rarr;
            </a>
          </div>
        </section>
      )}

      <footer className="py-10 px-6 text-center border-t border-primary-100">
        <Link href={`/espaces/${espace.slug}`} className="text-sm text-luxury-slate hover:text-luxury-charcoal transition-colors">
          &larr; Retour au mini-site de {espace.name}
        </Link>
      </footer>
    </main>
  );
}
