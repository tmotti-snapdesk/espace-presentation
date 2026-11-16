"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { EspaceData } from "@/types/espace";
import EspaceDirectoryCard from "@/components/showcase/EspaceDirectoryCard";

interface EspaceDirectoryProps {
  espaces: EspaceData[];
}

export default function EspaceDirectory({ espaces }: EspaceDirectoryProps) {
  return (
    <main className="min-h-screen bg-luxury-cream">
      <section className="bg-luxury-charcoal text-white section-padding !pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Image
              src="/images/Logo Snapdesk Blanc.png"
              alt="Snapdesk"
              width={160}
              height={40}
              className="h-8 md:h-10 w-auto mb-10"
              priority
            />
            <p className="luxury-label text-luxury-champagne mb-3">Espace brokers</p>
            <h1 className="font-serif text-4xl md:text-6xl font-medium mb-4 tracking-tight">
              Nos espaces disponibles
            </h1>
            <p className="text-white/70 text-lg font-light max-w-2xl">
              Parcourez l&apos;ensemble de nos espaces et accédez en un clic à leur fiche : éléments clés, présentation commerciale et photos.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding !pt-16">
        <div className="max-w-7xl mx-auto">
          {espaces.length === 0 ? (
            <p className="text-center text-luxury-slate py-20">
              Aucun espace disponible pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {espaces.map((espace, i) => (
                <motion.div
                  key={espace.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (i % 6) * 0.08 }}
                >
                  <EspaceDirectoryCard espace={espace} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
