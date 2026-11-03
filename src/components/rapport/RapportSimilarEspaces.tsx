"use client";

import { motion } from "framer-motion";
import { SimilarEspace, MarketStudyOwnAsset } from "@/types/rapport";

interface RapportSimilarEspacesProps {
  espaceName: string;
  espaceAddress?: string;
  ownAsset?: MarketStudyOwnAsset;
  similarEspaces: SimilarEspace[];
  comment?: string;
}

interface ComparisonRow {
  key: string;
  name: string;
  location: string;
  workstations: string;
  surface: string;
  price: string;
  pricePerWorkstation: string;
  isOwn?: boolean;
}

const COLUMNS: { key: keyof Omit<ComparisonRow, "key" | "name" | "isOwn">; label: string }[] = [
  { key: "location", label: "Localisation" },
  { key: "workstations", label: "Postes" },
  { key: "surface", label: "Surface" },
  { key: "price", label: "Loyer" },
  { key: "pricePerWorkstation", label: "Prix / poste" },
];

/**
 * Étude de marché : tableau comparatif (l'espace du propriétaire en tête,
 * puis les offres comparables), fiches détaillées des offres et commentaire.
 */
export default function RapportSimilarEspaces({
  espaceName,
  espaceAddress = "",
  ownAsset,
  similarEspaces,
  comment = "",
}: RapportSimilarEspacesProps) {
  if (similarEspaces.length === 0) return null;

  const rows: ComparisonRow[] = [
    {
      key: "own",
      name: espaceName,
      location: espaceAddress,
      workstations: ownAsset?.workstations || "",
      surface: ownAsset?.surface || "",
      price: ownAsset?.price || "",
      pricePerWorkstation: ownAsset?.pricePerWorkstation || "",
      isOwn: true,
    },
    ...similarEspaces.map((e) => ({
      key: e.id,
      name: e.name,
      location: e.location || "",
      workstations: e.workstations || "",
      surface: e.surface || "",
      price: e.price || "",
      pricePerWorkstation: e.pricePerWorkstation || "",
    })),
  ];
  // On n'affiche que les colonnes renseignées pour au moins une ligne.
  const columns = COLUMNS.filter((c) => rows.some((r) => r[c.key]));

  return (
    <section id="etude-marche" className="section-padding bg-luxury-cream scroll-mt-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Pour comparer</p>
          <h2 className="luxury-subheading text-luxury-charcoal mb-4">Étude de marché</h2>
          <div className="luxury-divider" />
          <p className="mt-6 max-w-3xl text-luxury-slate leading-relaxed">
            Une sélection d&apos;offres équivalentes actuellement commercialisées, pour
            situer votre espace sur son marché.
          </p>
        </motion.div>

        {columns.length > 0 && (
          <motion.div
            className="mb-14 overflow-x-auto rounded-lg border border-primary-100 bg-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100">
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.18em] font-medium text-luxury-slate">
                    Espace
                  </th>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className="px-5 py-4 text-[10px] uppercase tracking-[0.18em] font-medium text-luxury-slate"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className={
                      row.isOwn
                        ? "bg-luxury-champagne/40 border-b border-luxury-gold/30"
                        : "border-b border-primary-100 last:border-b-0"
                    }
                  >
                    <td className="px-5 py-4">
                      <span className="font-serif text-base text-luxury-charcoal">
                        {row.name || "—"}
                      </span>
                      {row.isOwn && (
                        <span className="ml-2 inline-block text-[10px] uppercase tracking-[0.15em] text-luxury-gold">
                          Votre espace
                        </span>
                      )}
                    </td>
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-5 py-4 ${
                          c.key === "pricePerWorkstation"
                            ? "font-medium text-luxury-charcoal"
                            : "text-luxury-slate"
                        }`}
                      >
                        {row[c.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

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
                  <h3 className="font-serif text-xl text-luxury-charcoal mb-1">
                    {espace.name}
                  </h3>
                  {espace.location && (
                    <p className="text-xs uppercase tracking-[0.15em] text-luxury-slate mb-3">
                      {espace.location}
                    </p>
                  )}
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

        {comment && (
          <motion.div
            className="mt-14 p-6 md:p-8 border-l-2 border-luxury-gold bg-white rounded-r-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-luxury-gold mb-3">
              Notre lecture
            </p>
            <p className="text-luxury-charcoal leading-relaxed whitespace-pre-line">{comment}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
