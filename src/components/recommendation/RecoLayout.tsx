"use client";

import { useState } from "react";
import styles from "./reco.module.css";

export function RecoHeader({ label }: { label: string }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        {!imgFailed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/images/Logo Snapdesk Blanc.png"
            alt="Snapdesk"
            className="h-7 w-auto block"
            style={{ filter: "invert(1)" }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span
            className={`${styles.fraunces} italic font-normal text-[24px] tracking-[-0.02em] text-reco-ink`}
          >
            snapdesk
          </span>
        )}
      </div>
      <div className="text-[11px] text-reco-ink-faint tracking-[0.1em] uppercase font-semibold py-[5px] px-2.5 bg-reco-elev border border-reco-line rounded-full">
        {label}
      </div>
    </header>
  );
}

export function RecoFooter() {
  return (
    <footer className="mt-auto pt-8 text-center text-reco-ink-faint text-[12px]">
      Snapdesk · Espaces de travail flex
    </footer>
  );
}

export function BonusCard() {
  return (
    <div
      className={`rounded-[22px] px-5 py-[18px] flex items-center gap-4 mb-7 ${styles.bonusCard}`}
    >
      <div
        className={`w-[46px] h-[46px] rounded-[13px] bg-reco-gold text-white flex items-center justify-center shrink-0 ${styles.bonusIcon} ${styles.fraunces}`}
        style={{ fontSize: 22, fontWeight: 500 }}
        aria-hidden
      >
        €
      </div>
      <div className="flex-1 min-w-0 relative z-[1]">
        <div className="text-[11px] text-reco-ink-soft tracking-[0.08em] uppercase font-semibold mb-0.5">
          Bonus parrainage
        </div>
        <div
          className={`${styles.fraunces} text-[22px] font-medium text-reco-ink tracking-[-0.01em] leading-[1.15] mb-[5px]`}
        >
          150 € tout de suite
          <span className="text-reco-ink-faint font-normal"> · </span>
          jusqu&apos;à 5 000 € à la signature
        </div>
        <div className="text-[13px] text-reco-ink-soft leading-[1.4]">
          150 € versés dès qu&apos;on a confirmé que la recherche est sérieuse. Jusqu&apos;à
          5 000 € si votre filleul signe, selon le nombre de postes.
        </div>
      </div>
    </div>
  );
}

export function SuccessSection() {
  return (
    <section className={`flex-1 flex flex-col ${styles.screen}`}>
      <div className="text-center py-10 flex-1 flex flex-col items-center justify-center">
        <div
          className={`w-[76px] h-[76px] rounded-full bg-reco-accent-soft flex items-center justify-center mb-7 ${styles.successGlyph}`}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E590A1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2
          className={`${styles.fraunces} font-normal text-[26px] leading-[1.15] tracking-[-0.02em] mb-3`}
        >
          Merci{" "}
          <em className={`${styles.fraunces} italic text-reco-accent`}>infiniment</em>.
        </h2>
        <p className="text-reco-ink-soft max-w-[38ch] mx-auto mb-3">
          On revient vers vous très vite, et on prendra contact avec votre proche avec
          délicatesse.
        </p>
        <p className="text-reco-ink-soft max-w-[38ch] mx-auto mb-3 text-[14px]">
          Dès qu&apos;on a confirmé que la recherche est sérieuse, on vous verse{" "}
          <strong className="text-reco-ink">150 €</strong>. Et si signature,{" "}
          <strong className="text-reco-ink">jusqu&apos;à 5 000 €</strong>.
        </p>
        <p className="text-[14px] text-reco-ink-faint mt-2">— L&apos;équipe Snapdesk</p>
      </div>
    </section>
  );
}
