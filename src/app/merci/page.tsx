"use client";

import { useEffect, useRef, useState } from "react";
import RecommendationForm from "@/components/recommendation/RecommendationForm";
import {
  BonusCard,
  RecoFooter,
  RecoHeader,
  SuccessSection,
} from "@/components/recommendation/RecoLayout";
import styles from "@/components/recommendation/reco.module.css";

type Screen = "home" | "review" | "waiting" | "refer" | "success";

const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
  "https://g.page/r/Ceb-cozTL1M2EAE/review";

const SCREEN_META: Record<Screen, { label: string; step: number }> = {
  home: { label: "Bienvenue", step: 0 },
  review: { label: "Étape 1 / 2", step: 1 },
  waiting: { label: "Étape 1 / 2", step: 1 },
  refer: { label: "Étape 2 / 2", step: 2 },
  success: { label: "Merci !", step: 3 },
};

export default function MerciPage() {
  const [screen, setScreen] = useState<Screen>("home");
  const [googleOpened, setGoogleOpened] = useState(false);
  const autoAdvanceArmed = useRef(false);

  const goTo = (s: Screen) => {
    setScreen(s);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openGoogleReview = () => {
    window.open(GOOGLE_REVIEW_URL, "_blank", "noopener");
    setGoogleOpened(true);
    autoAdvanceArmed.current = true;
    goTo("waiting");
  };

  useEffect(() => {
    const tryAutoAdvance = () => {
      if (autoAdvanceArmed.current && screen === "waiting") {
        setTimeout(() => {
          if (autoAdvanceArmed.current) {
            autoAdvanceArmed.current = false;
            goTo("refer");
          }
        }, 600);
      }
    };

    const onVisibility = () => {
      if (!document.hidden) tryAutoAdvance();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", tryAutoAdvance);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", tryAutoAdvance);
    };
  }, [screen]);

  const meta = SCREEN_META[screen];

  return (
    <main className={`min-h-dvh bg-reco-bg text-reco-ink font-geist ${styles.app}`}>
      <div className="max-w-[560px] mx-auto px-[22px] pt-6 pb-12 min-h-dvh flex flex-col">
        <RecoHeader label={meta.label} />

        {meta.step > 0 && screen !== "success" && (
          <ProgressBar step={meta.step} />
        )}

        {screen === "home" && <HomeScreen onStart={() => goTo("review")} onSkip={() => goTo("refer")} />}
        {screen === "review" && (
          <ReviewScreen onOpenGoogle={openGoogleReview} onSkip={() => goTo("refer")} />
        )}
        {screen === "waiting" && (
          <WaitingScreen onContinue={() => goTo("refer")} onReopen={openGoogleReview} />
        )}
        {screen === "refer" && (
          <ReferScreen googleOpened={googleOpened} onSuccess={() => goTo("success")} />
        )}
        {screen === "success" && <SuccessSection />}

        <RecoFooter />
      </div>
    </main>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 mb-9">
      <div
        className={`flex-1 h-[3px] bg-reco-line rounded-[2px] ${styles.progressSeg} ${
          step === 1 ? styles.progressSegActive : ""
        } ${step >= 2 ? styles.progressSegDone : ""}`}
      />
      <div
        className={`flex-1 h-[3px] bg-reco-line rounded-[2px] ${styles.progressSeg} ${
          step >= 2 ? styles.progressSegActive : ""
        }`}
      />
    </div>
  );
}

function HomeScreen({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <section className={`flex-1 flex flex-col ${styles.screen}`}>
      <div className={styles.stagger}>
        <p className="text-[12px] tracking-[0.12em] uppercase text-reco-accent font-semibold mb-3.5">
          Un grand merci
        </p>
        <h1
          className={`${styles.fraunces} font-normal leading-[1.05] tracking-[-0.025em] mb-4 text-[clamp(32px,7.5vw,42px)]`}
        >
          2 petites <em className={`${styles.fraunces} italic text-reco-accent`}>demandes</em>,
          1 minute&nbsp;chrono.
        </h1>
        <p className="text-reco-ink-soft text-[17px] leading-[1.55] mb-8 max-w-[42ch]">
          D&apos;abord un avis Google, puis une recommandation. Si vous nous présentez
          quelqu&apos;un qui cherche vraiment&nbsp;:{" "}
          <span className={styles.accentStrong}>150&nbsp;€ pour vous tout de suite</span>, et{" "}
          <span className={styles.accentStrong}>jusqu&apos;à 5 000&nbsp;€</span>{" "}
          s&apos;il signe chez nous.
        </p>
        <button
          type="button"
          onClick={onStart}
          className={`bg-reco-ink text-reco-bg border-0 rounded-full px-7 py-4 text-[15px] font-medium cursor-pointer transition-all inline-flex items-center justify-center gap-2 w-full tracking-[0.01em] ${styles.btnPrimary}`}
        >
          C&apos;est parti →
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="bg-transparent border-0 text-reco-ink-faint font-inherit text-[13px] cursor-pointer p-3 underline underline-offset-[3px] mt-2 self-center hover:text-reco-ink-soft"
        >
          Sauter l&apos;avis et passer direct à la reco
        </button>
      </div>
    </section>
  );
}

function ReviewScreen({
  onOpenGoogle,
  onSkip,
}: {
  onOpenGoogle: () => void;
  onSkip: () => void;
}) {
  const Star = () => (
    <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-reco-gold">
      <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.771l-7.416 3.642 1.48-8.279L0 9.306l8.332-1.151z" />
    </svg>
  );
  return (
    <section className={`flex-1 flex flex-col ${styles.screen}`}>
      <div className={styles.stagger}>
        <p className="text-[12px] tracking-[0.12em] uppercase text-reco-accent font-semibold mb-3.5">
          Étape 1 sur 2 · Avis Google
        </p>
        <div className={`inline-flex gap-1 mb-5 ${styles.starsDeco}`} aria-hidden>
          <Star />
          <Star />
          <Star />
          <Star />
          <Star />
        </div>
        <h1
          className={`${styles.fraunces} font-normal leading-[1.05] tracking-[-0.025em] mb-4 text-[clamp(32px,7.5vw,42px)]`}
        >
          Quelques mots <em className={`${styles.fraunces} italic text-reco-accent`}>sincères</em>,
          ça change tout.
        </h1>
        <p className="text-reco-ink-soft text-[17px] leading-[1.55] mb-8 max-w-[42ch]">
          Bons ou constructifs, vos retours sont précieux. On ouvre Google Maps dans un nouvel
          onglet — vous laissez votre avis, puis revenez ici pour l&apos;étape&nbsp;2.
        </p>

        <div className="flex flex-col gap-2.5 mt-3">
          <button
            type="button"
            onClick={onOpenGoogle}
            className={`bg-reco-accent text-white border-0 rounded-full px-7 py-4 text-[15px] font-medium cursor-pointer transition-all inline-flex items-center justify-center gap-2 w-full tracking-[0.01em] ${styles.btnGoogle}`}
          >
            Laisser mon avis sur Google
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M7 17L17 7M17 7H8M17 7V16" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="bg-transparent border-0 text-reco-ink-faint font-inherit text-[13px] cursor-pointer p-3 underline underline-offset-[3px] mt-2 self-center hover:text-reco-ink-soft"
          >
            Pas envie d&apos;avis Google ? Passer à la reco
          </button>
        </div>
      </div>
    </section>
  );
}

function WaitingScreen({
  onContinue,
  onReopen,
}: {
  onContinue: () => void;
  onReopen: () => void;
}) {
  return (
    <section className={`flex-1 flex flex-col ${styles.screen}`}>
      <div className={styles.stagger}>
        <p className="text-[12px] tracking-[0.12em] uppercase text-reco-accent font-semibold mb-3.5">
          Étape 1 sur 2 · En cours
        </p>
        <h1
          className={`${styles.fraunces} font-normal leading-[1.05] tracking-[-0.025em] mb-4 text-[clamp(32px,7.5vw,42px)]`}
        >
          On vous attend{" "}
          <em className={`${styles.fraunces} italic text-reco-accent`}>tranquillement</em>.
        </h1>

        <div
          className={`bg-reco-elev border border-reco-line rounded-[22px] px-6 py-7 mt-2 ${styles.waitingCard}`}
        >
          <div className="relative">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 bg-reco-accent-soft rounded-[14px] mb-3.5 ${styles.waitingIcon}`}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E590A1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div className={`${styles.fraunces} text-[20px] mb-2`}>
              Google est ouvert dans un autre onglet
            </div>
            <div className="text-reco-ink-soft text-[15px] mb-[22px]">
              Une fois votre avis publié, revenez ici. On enchaîne automatiquement sur
              l&apos;étape&nbsp;2.
            </div>

            <div className="flex flex-col gap-2.5 mt-3">
              <button
                type="button"
                onClick={onContinue}
                className={`bg-reco-ink text-reco-bg border-0 rounded-full px-7 py-4 text-[15px] font-medium cursor-pointer transition-all inline-flex items-center justify-center gap-2 w-full tracking-[0.01em] ${styles.btnPrimary}`}
              >
                C&apos;est fait, on passe à la suite →
              </button>
              <button
                type="button"
                onClick={onReopen}
                className={`bg-reco-elev text-reco-ink border border-reco-line rounded-full px-[18px] py-2.5 text-[13px] font-medium cursor-pointer transition-all inline-flex items-center justify-center gap-2 w-full ${styles.btnSecondary}`}
              >
                Rouvrir Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReferScreen({
  googleOpened,
  onSuccess,
}: {
  googleOpened: boolean;
  onSuccess: () => void;
}) {
  return (
    <section className={`flex-1 flex flex-col ${styles.screen}`}>
      <div className={styles.stagger}>
        <p className="text-[12px] tracking-[0.12em] uppercase text-reco-accent font-semibold mb-3.5">
          Étape 2 sur 2 · Recommandation
        </p>
        <h1
          className={`${styles.fraunces} font-normal leading-[1.05] tracking-[-0.025em] mb-4 text-[clamp(32px,7.5vw,42px)]`}
        >
          Une <em className={`${styles.fraunces} italic text-reco-accent`}>introduction</em> en
          cadeau&nbsp;?
        </h1>
        <p className="text-reco-ink-soft text-[17px] leading-[1.55] mb-7 max-w-[42ch]">
          Quelqu&apos;un dans votre réseau pourrait avoir besoin d&apos;un espace de travail
          flex. Présentez-le-nous, on prend contact en douceur en glissant votre nom.
        </p>

        <BonusCard />
      </div>

      <RecommendationForm
        source="snapdesk-merci-page"
        googleReviewOpened={googleOpened}
        onSuccess={onSuccess}
      />
    </section>
  );
}
