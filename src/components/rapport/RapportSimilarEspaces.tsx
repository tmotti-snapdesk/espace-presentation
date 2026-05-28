"use client";

import { motion } from "framer-motion";
import { SimilarEspace } from "@/types/rapport";

interface RapportSimilarEspacesProps {
  similarEspaces: SimilarEspace[];
}

export default function RapportSimilarEspaces({
  similarEspaces,
}: RapportSimilarEspacesProps) {
  if (similarEspaces.length === 0) return null;

  return (
    <section id="similaires" className="section-padding bg-luxury-cream scroll-mt-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Pour comparer</p>
          <h2 className="luxury-subheading text-luxury-charcoal mb-4">
            Espaces similaires actuellement sur le marché
          </h2>
          <div className="luxury-divider" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarEspaces.map((espace, i) => {
            const card = (
              <div className="bg-white border border-primary-100 rounded-lg overflow-hidden h-full transition-shadow group-hover:shadow-lg flex flex-col">
                <div
                  className="aspect-[4/3] bg-primary-100 bg-cover bg-center"
                  style={espace.image ? { backgroundImage: `url(${espace.image})` } : undefined}
                >
                  {!espace.image && (
                    <div className="w-full h-full flex items-center justify-center text-luxury-slate/50 text-xs uppercase tracking-widest">
                      Visuel à venir
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-serif text-xl text-luxury-charcoal mb-2">
                    {espace.name}
                  </h3>
                  {espace.description && (
                    <p className="text-sm text-luxury-slate leading-relaxed mb-4 flex-1">
                      {espace.description}
                    </p>
                  )}
                  <div className="flex items-baseline justify-between gap-3 pt-4 border-t border-primary-100">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-luxury-slate mb-0.5">
                        Postes
                      </p>
                      <p className="font-serif text-lg text-luxury-charcoal">
                        {espace.workstations || "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-luxury-slate mb-0.5">
                        Loyer
                      </p>
                      <p className="font-serif text-lg text-luxury-gold">
                        {espace.price || "—"}
                      </p>
                    </div>
                  </div>
                  {espace.url && (
                    <p className="mt-4 text-xs uppercase tracking-[0.15em] text-luxury-charcoal group-hover:text-luxury-gold transition-colors">
                      Voir l&apos;annonce &rarr;
                    </p>
                  )}
                </div>
              </div>
            );

            return (
              <motion.div
                key={espace.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group"
              >
                {espace.url ? (
                  <a
                    href={espace.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    {card}
                  </a>
                ) : (
                  card
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
