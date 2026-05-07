"use client";

import { useState } from "react";
import RecommendationForm from "@/components/recommendation/RecommendationForm";
import {
  BonusCard,
  RecoFooter,
  RecoHeader,
  SuccessSection,
} from "@/components/recommendation/RecoLayout";
import styles from "@/components/recommendation/reco.module.css";

export default function RecommanderPage() {
  const [done, setDone] = useState(false);

  return (
    <main className={`min-h-dvh bg-reco-bg text-reco-ink font-geist ${styles.app}`}>
      <div className="max-w-[560px] mx-auto px-[22px] pt-6 pb-12 min-h-dvh flex flex-col">
        <RecoHeader label="Parrainage" />

        {!done ? (
          <ReferSection onSuccess={() => setDone(true)} />
        ) : (
          <SuccessSection />
        )}

        <RecoFooter />
      </div>
    </main>
  );
}

function ReferSection({ onSuccess }: { onSuccess: () => void }) {
  return (
    <section className={`flex-1 flex flex-col ${styles.screen}`}>
      <div className={styles.stagger}>
        <p className="text-[12px] tracking-[0.12em] uppercase text-reco-accent font-semibold mb-3.5">
          Recommandez un proche
        </p>
        <h1
          className={`${styles.fraunces} font-normal leading-[1.05] tracking-[-0.025em] mb-4 text-[clamp(32px,7.5vw,42px)]`}
        >
          Vous connaissez quelqu&apos;un qui cherche un{" "}
          <em className={`${styles.fraunces} italic text-reco-accent`}>bureau</em> ?
        </h1>
        <p className="text-reco-ink-soft text-[17px] leading-[1.55] mb-7 max-w-[42ch]">
          Présentez-le-nous. On prend contact en douceur en glissant votre nom — et vous êtes
          récompensé deux fois si la recherche est sérieuse.
        </p>

        <BonusCard />
        <HowItWorks />
      </div>

      <RecommendationForm
        source="snapdesk-reco-direct"
        showSenderPhone
        requireSenderEmail
        onSuccess={onSuccess}
      />
    </section>
  );
}

function HowItWorks() {
  const steps = [
    <>Vous nous présentez votre proche ci-dessous.</>,
    <>
      On le contacte. Si la recherche est réelle
      <sup className="text-reco-accent font-semibold ml-0.5">*</sup>&nbsp;:{" "}
      <strong className="text-reco-ink font-medium">150&nbsp;€ pour vous</strong>.
    </>,
    <>
      S&apos;il signe chez Snapdesk&nbsp;:{" "}
      <strong className="text-reco-ink font-medium">jusqu&apos;à 5 000&nbsp;€</strong>.
    </>,
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-3 px-5 py-[18px] bg-reco-elev border border-reco-line rounded-[22px]">
        {steps.map((text, i) => (
          <div key={i} className="flex gap-3.5 items-start">
            <div
              className={`shrink-0 w-[26px] h-[26px] rounded-full bg-reco-accent-soft text-reco-accent-deep flex items-center justify-center font-medium text-[14px] ${styles.fraunces}`}
            >
              {i + 1}
            </div>
            <div className="text-[14px] text-reco-ink-soft leading-[1.45] pt-0.5">{text}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 px-1 text-[12px] text-reco-ink-faint leading-[1.5]">
        <p className="mb-1">
          <span className="text-reco-accent font-semibold">*</span> Recherche
          considérée comme réelle si&nbsp;:
        </p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>prise de contact sans brokerage&nbsp;;</li>
          <li>
            recherche d&apos;un espace de bureau de plus de 5 postes à Paris
            intramuros.
          </li>
        </ul>
      </div>
    </div>
  );
}
