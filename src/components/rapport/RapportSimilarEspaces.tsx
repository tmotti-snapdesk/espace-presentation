"use client";

import { motion } from "framer-motion";
import {
  SimilarEspace,
  RapportMarketStudy,
  parseAmount,
  median,
  formatPricePerSqm,
  formatAvailability,
} from "@/types/rapport";

interface RapportSimilarEspacesProps {
  espaceName: string;
  espaceAddress?: string;
  marketStudy?: RapportMarketStudy;
  similarEspaces: SimilarEspace[];
}

interface ComparisonRow {
  key: string;
  name: string;
  description: string;
  location: string;
  surface: string;
  workstations: string;
  price: string;
  pricePerWorkstation: string;
  pricePerSqmYear: string;
  availability: string;
  isOwn?: boolean;
}

type ColumnKey = Exclude<keyof ComparisonRow, "key" | "name" | "description" | "isOwn">;

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "location", label: "Localisation" },
  { key: "surface", label: "Surface" },
  { key: "workstations", label: "Postes" },
  { key: "price", label: "Loyer" },
  { key: "pricePerWorkstation", label: "Prix / poste" },
  { key: "pricePerSqmYear", label: "Prix / m² / an" },
  { key: "availability", label: "Disponibilité" },
];

/** Un prix au m² saisi en chiffres est mis en forme (« 540 » → « 540 €/m²/an »). */
function displaySqm(value: string): string {
  if (!value) return "";
  const n = parseAmount(value);
  return n !== null && /^[\d\s  .,]+$/.test(value) ? formatPricePerSqm(n) : value;
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-6 md:p-8 rounded-lg border ${
        highlight ? "border-luxury-gold/40 bg-luxury-champagne/30" : "border-primary-100 bg-white"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-luxury-slate mb-3 leading-snug">
        {label}
      </p>
      <p className="font-serif text-3xl md:text-4xl text-luxury-charcoal">{value}</p>
      {sub && <p className="mt-2 text-sm text-luxury-slate">{sub}</p>}
    </div>
  );
}

/**
 * Étude de marché : chiffres du secteur (offres disponibles, médiane, position
 * de l'espace), tableau comparatif (l'espace du propriétaire en tête, puis les
 * offres comparables et la médiane), fiches des offres et commentaire.
 */
export default function RapportSimilarEspaces({
  espaceName,
  espaceAddress = "",
  marketStudy,
  similarEspaces,
}: RapportSimilarEspacesProps) {
  if (similarEspaces.length === 0) return null;

  const own = marketStudy?.ownAsset;
  const comment = marketStudy?.comment || "";
  const sectorName = marketStudy?.sectorName || "";
  const sectorOfferCount = marketStudy?.sectorOfferCount || "";

  // Médiane €/m²/an : saisie à la main si renseignée, sinon calculée sur les offres.
  const offerPrices = similarEspaces
    .map((s) => parseAmount(s.pricePerSqmYear))
    .filter((n): n is number => n !== null);
  const manualMedian = parseAmount(marketStudy?.medianOverride);
  const medianValue = manualMedian ?? median(offerPrices);
  const medianSub =
    manualMedian !== null
      ? sectorName
        ? `Secteur ${sectorName}`
        : "Sur le secteur"
      : `Calculée sur ${offerPrices.length} offre${offerPrices.length > 1 ? "s" : ""} comparable${
          offerPrices.length > 1 ? "s" : ""
        }`;

  const ownPrice = parseAmount(own?.pricePerSqmYear);
  let positionSub = "";
  if (ownPrice !== null && medianValue) {
    const gap = Math.round(((ownPrice - medianValue) / medianValue) * 100);
    positionSub =
      gap === 0
        ? "Au niveau de la médiane"
        : `${Math.abs(gap)} % ${gap > 0 ? "au-dessus" : "en dessous"} de la médiane`;
  }

  const rows: ComparisonRow[] = [
    {
      key: "own",
      name: espaceName,
      description: "",
      location: espaceAddress,
      surface: own?.surface || "",
      workstations: own?.workstations || "",
      price: own?.price || "",
      pricePerWorkstation: own?.pricePerWorkstation || "",
      pricePerSqmYear: displaySqm(own?.pricePerSqmYear || ""),
      availability: formatAvailability(own?.availability),
      isOwn: true,
    },
    ...similarEspaces.map((e) => ({
      key: e.id,
      name: e.name,
      description: e.description || "",
      location: e.location || "",
      surface: e.surface || "",
      workstations: e.workstations || "",
      price: e.price || "",
      pricePerWorkstation: e.pricePerWorkstation || "",
      pricePerSqmYear: displaySqm(e.pricePerSqmYear || ""),
      availability: formatAvailability(e.availability),
    })),
  ];
  // On n'affiche que les colonnes renseignées pour au moins une ligne.
  const columns = COLUMNS.filter((c) => rows.some((r) => r[c.key]));
  const showMedianRow = medianValue !== null && columns.some((c) => c.key === "pricePerSqmYear");

  const stats = [
    sectorOfferCount && {
      label: "Offres disponibles sur le secteur",
      value: sectorOfferCount,
      sub: sectorName,
    },
    medianValue !== null && {
      label: "Prix médian du marché",
      value: formatPricePerSqm(medianValue),
      sub: medianSub,
    },
    ownPrice !== null && {
      label: "Votre espace",
      value: formatPricePerSqm(ownPrice),
      sub: positionSub,
      highlight: true,
    },
  ].filter(Boolean) as { label: string; value: string; sub?: string; highlight?: boolean }[];

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
            Une sélection d&apos;offres équivalentes actuellement commercialisées
            {sectorName ? ` sur le secteur ${sectorName}` : ""}, pour situer votre espace sur
            son marché.
          </p>
        </motion.div>

        {stats.length > 0 && (
          <div
            className={`grid grid-cols-1 gap-4 mb-12 ${
              stats.length === 3 ? "md:grid-cols-3" : stats.length === 2 ? "md:grid-cols-2" : ""
            }`}
          >
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        )}

        {columns.length > 0 && (
          <motion.div
            className="mb-14 overflow-x-auto rounded-lg border border-primary-100 bg-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100">
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.18em] font-medium text-luxury-slate">
                    Offre
                  </th>
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className="px-4 py-4 text-[10px] uppercase tracking-[0.18em] font-medium text-luxury-slate whitespace-nowrap"
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
                        ? "bg-luxury-champagne/40 border-b border-luxury-gold/30 align-top"
                        : "border-b border-primary-100 align-top"
                    }
                  >
                    <td className="px-5 py-4 min-w-[220px]">
                      <span className="font-serif text-base text-luxury-charcoal">
                        {row.name || "—"}
                      </span>
                      {row.isOwn && (
                        <span className="ml-2 inline-block text-[10px] uppercase tracking-[0.15em] text-luxury-gold">
                          Votre espace
                        </span>
                      )}
                      {row.description && (
                        <p className="mt-1 text-xs text-luxury-slate leading-relaxed whitespace-pre-line">
                          {row.description}
                        </p>
                      )}
                    </td>
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-4 py-4 ${
                          c.key === "pricePerSqmYear"
                            ? "font-medium text-luxury-charcoal whitespace-nowrap"
                            : "text-luxury-slate"
                        }`}
                      >
                        {row[c.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
                {showMedianRow && (
                  <tr className="bg-luxury-charcoal text-white">
                    <td className="px-5 py-4">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-luxury-champagne">
                        Médiane du marché
                      </span>
                    </td>
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-4 whitespace-nowrap font-medium">
                        {c.key === "pricePerSqmYear" && medianValue !== null
                          ? formatPricePerSqm(medianValue)
                          : ""}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarEspaces.map((espace, i) => {
            const sqm = displaySqm(espace.pricePerSqmYear || "");
            const availability = formatAvailability(espace.availability);
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
                  <h3 className="font-serif text-xl text-luxury-charcoal mb-1">{espace.name}</h3>
                  {espace.location && (
                    <p className="text-xs uppercase tracking-[0.15em] text-luxury-slate mb-3">
                      {espace.location}
                    </p>
                  )}
                  {espace.description && (
                    <p className="text-sm text-luxury-slate leading-relaxed mb-4 flex-1 whitespace-pre-line">
                      {espace.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-baseline justify-between gap-3 pt-4 border-t border-primary-100">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-luxury-slate mb-0.5">
                        Prix / m² / an
                      </p>
                      <p className="font-serif text-lg text-luxury-gold">
                        {sqm || espace.price || "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-luxury-slate mb-0.5">
                        Disponibilité
                      </p>
                      <p className="font-serif text-lg text-luxury-charcoal">
                        {availability || "—"}
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
                  <a href={espace.url} target="_blank" rel="noopener noreferrer" className="block h-full">
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
