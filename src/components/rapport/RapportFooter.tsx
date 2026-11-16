"use client";

import Image from "next/image";

interface RapportFooterProps {
  espaceName: string;
}

export default function RapportFooter({ espaceName }: RapportFooterProps) {
  return (
    <footer className="bg-luxury-dark text-white/70 py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Image
            src="/images/Logo Snapdesk Blanc.png"
            alt="Snapdesk"
            width={120}
            height={30}
            className="h-8 w-auto opacity-80"
          />
          <p className="text-xs uppercase tracking-[0.2em] text-luxury-champagne/60">
            Rapport mensuel
          </p>
        </div>
        <p className="text-sm font-light text-center md:text-right">
          Rapport préparé par les équipes Snapdesk pour {espaceName}.
        </p>
      </div>
    </footer>
  );
}
