"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { formatMonthLabel, formatLongDate } from "@/types/rapport";

interface RapportHeroProps {
  espaceName: string;
  espaceAddress: string;
  month: string;
  marketingStartDate: string;
  ownerName: string;
  presentationUrl: string;
}

export default function RapportHero({
  espaceName,
  espaceAddress,
  month,
  marketingStartDate,
  ownerName,
  presentationUrl,
}: RapportHeroProps) {
  const monthLabel = formatMonthLabel(month);
  const startLabel = formatLongDate(marketingStartDate);

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <section className="relative w-full overflow-hidden bg-luxury-charcoal text-white">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #c5a572 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 px-6 md:px-12 lg:px-24 pt-12 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-6 mb-16">
            <Image
              src="/images/Logo Snapdesk Blanc.png"
              alt="Snapdesk"
              width={160}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
            <div className="flex flex-col items-end gap-4">
              <p className="luxury-label text-luxury-champagne text-right">
                Rapport de commercialisation
                <br />
                <span className="capitalize">{monthLabel}</span>
              </p>
              <button
                type="button"
                onClick={handlePrint}
                className="no-print inline-flex items-center gap-2 px-4 py-2 border border-white/30 text-white/90 text-xs uppercase tracking-[0.15em] font-medium hover:bg-white/10 transition-colors rounded"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Télécharger en PDF
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium mb-6 tracking-tight">
              {espaceName}
            </h1>
            {espaceAddress && (
              <p className="text-white/70 text-lg md:text-xl font-light mb-10">
                {espaceAddress}
              </p>
            )}

            {presentationUrl && (
              <a
                href={presentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 mb-10 bg-luxury-champagne text-luxury-charcoal text-sm uppercase tracking-[0.15em] font-medium rounded hover:bg-white transition-colors group"
              >
                Voir la présentation commerciale
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            )}

            <div className="flex flex-wrap items-end gap-x-16 gap-y-6 pt-10 border-t border-white/10">
              {startLabel && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-luxury-champagne/70 mb-2">
                    Commercialisé depuis
                  </p>
                  <p className="text-2xl font-serif text-white">{startLabel}</p>
                </div>
              )}
              {ownerName && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-luxury-champagne/70 mb-2">
                    Préparé pour
                  </p>
                  <p className="text-2xl font-serif text-luxury-champagne">
                    {ownerName}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
