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
}

export default function RapportHero({
  espaceName,
  espaceAddress,
  month,
  marketingStartDate,
  ownerName,
}: RapportHeroProps) {
  const monthLabel = formatMonthLabel(month);
  const startLabel = formatLongDate(marketingStartDate);

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
          <div className="flex items-center justify-between mb-16">
            <Image
              src="/images/Logo Snapdesk Blanc.png"
              alt="Snapdesk"
              width={160}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
            <p className="luxury-label text-luxury-champagne text-right">
              Rapport de commercialisation
              <br />
              <span className="capitalize">{monthLabel}</span>
            </p>
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
