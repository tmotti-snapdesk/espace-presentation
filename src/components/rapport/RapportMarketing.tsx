"use client";

import { motion } from "framer-motion";
import { RapportDistribution, DISTRIBUTION_LABELS } from "@/types/rapport";

interface RapportMarketingProps {
  monthlyBudget: string;
  matchingFormsCount: number;
  preselectionCount: number;
  brokersListingActive: boolean;
  brokersListingCount: number;
  contactBaseActive?: boolean;
  contactBaseCount?: number;
  distribution: RapportDistribution;
  otherMarketingActions: string[];
  showKpis?: boolean;
  showDistribution?: boolean;
  showOther?: boolean;
}

function KpiCard({
  label,
  value,
  description,
  highlight,
}: {
  label: string;
  value: string | number;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-6 md:p-8 rounded-lg border ${
        highlight
          ? "border-luxury-gold/40 bg-luxury-champagne/30"
          : "border-primary-100 bg-white"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-luxury-slate mb-3 leading-snug">
        {label}
      </p>
      <p
        className={`font-serif ${
          highlight
            ? "text-3xl md:text-4xl text-luxury-charcoal"
            : "text-3xl md:text-4xl text-luxury-charcoal"
        }`}
      >
        {value}
      </p>
      <p className="mt-4 pt-4 border-t border-primary-200 text-sm leading-relaxed text-luxury-slate">
        {description}
      </p>
    </div>
  );
}

export default function RapportMarketing({
  monthlyBudget,
  matchingFormsCount,
  preselectionCount,
  brokersListingActive,
  brokersListingCount,
  contactBaseActive = false,
  contactBaseCount = 15000,
  distribution,
  otherMarketingActions,
  showKpis = true,
  showDistribution = true,
  showOther = true,
}: RapportMarketingProps) {
  const distributionEntries = (
    Object.entries(DISTRIBUTION_LABELS) as [keyof RapportDistribution, string][]
  );

  return (
    <section id="marketing" className="section-padding bg-luxury-cream scroll-mt-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Marketing</p>
          <h2 className="luxury-subheading text-luxury-charcoal mb-4">
            Investissements & diffusion
          </h2>
          <div className="luxury-divider" />
        </motion.div>

        {showKpis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <KpiCard
              label="Budget marketing du mois"
              value={monthlyBudget || "—"}
              description="Investi pour aller chercher les dirigeants qui cherchent activement des bureaux, mais aussi ceux qui n'y pensaient pas encore et peuvent être séduits par une belle opportunité."
              highlight
            />
            <KpiCard
              label="Demandes qualifiées"
              value={matchingFormsCount}
              description="Entreprises en discussion avec nous dont la recherche correspond à votre espace : effectif, budget, localisation et agencement."
            />
            <KpiCard
              label="Décideurs sollicités"
              value={preselectionCount}
              description="Dirigeants et décideurs de notre base, au profil adapté à votre espace, à qui nous avons envoyé sa présentation complète."
            />
          </div>
        )}

        {brokersListingActive && (
          <motion.div
            className={`${contactBaseActive ? "mb-4" : "mb-12"} p-6 md:p-8 bg-luxury-charcoal text-white rounded-lg flex flex-col md:flex-row items-start md:items-center gap-6`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-luxury-gold shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 8l9 6 9-6" />
                <rect x="3" y="6" width="18" height="14" rx="1" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-luxury-champagne/80 mb-2">
                Réseau brokers
              </p>
              <p className="font-serif text-xl md:text-2xl leading-relaxed">
                Votre espace a été envoyé,{" "}
                <span className="text-luxury-champagne italic">tous les lundis</span>, à
                notre listing de{" "}
                <span className="text-luxury-champagne">{brokersListingCount}</span>{" "}
                brokers immobiliers.
              </p>
            </div>
          </motion.div>
        )}

        {contactBaseActive && (
          <motion.div
            className="mb-12 p-6 md:p-8 bg-[#3a332b] text-white rounded-lg flex flex-col md:flex-row items-start md:items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-luxury-gold shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="9" cy="8" r="3.2" />
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                <circle cx="17.5" cy="9" r="2.5" />
                <path d="M15.5 14.3c.6-.2 1.3-.3 2-.3 2.5 0 4.5 2 4.5 4.5" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-luxury-champagne/80 mb-2">
                Notre base de contacts
              </p>
              <p className="font-serif text-xl md:text-2xl leading-relaxed">
                Chaque mois, votre espace est présenté à notre base de{" "}
                <span className="text-luxury-champagne">
                  {contactBaseCount.toLocaleString("fr-FR")}
                </span>{" "}
                contacts : dirigeants, office managers et responsables immobiliers.
              </p>
            </div>
          </motion.div>
        )}

        {showDistribution && (
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-luxury-slate mb-5">
            Diffusion de l&apos;annonce
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {distributionEntries.map(([key, label]) => {
              const active = distribution[key];
              return (
                <div
                  key={key}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    active
                      ? "border-luxury-gold bg-white text-luxury-charcoal"
                      : "border-primary-200 bg-white/40 text-luxury-slate/50"
                  }`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full mb-2 ${
                      active
                        ? "bg-luxury-gold text-white"
                        : "bg-primary-100 text-luxury-slate/60"
                    }`}
                  >
                    {active ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span className="text-xs">—</span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
        )}

        {showOther && otherMarketingActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-luxury-slate mb-5">
              Autres actions marketing
            </p>
            <ul className="grid md:grid-cols-2 gap-3">
              {otherMarketingActions.map((action, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-4 bg-white border border-primary-100 rounded-lg"
                >
                  <span className="text-luxury-gold text-lg leading-none mt-0.5">◆</span>
                  <span className="text-luxury-charcoal text-sm leading-relaxed">
                    {action}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </section>
  );
}
