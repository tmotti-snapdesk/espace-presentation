"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LpProcessStep } from "@/types/lp";

interface LpUrgencyProps {
  label?: string;
  title?: string;
  subtitle?: string;
  steps?: LpProcessStep[];
  deadline?: string;
  expiredText?: string;
}

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function computeRemaining(deadlineMs: number): Remaining {
  const diff = deadlineMs - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, expired: false };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function LpUrgency({
  label,
  title,
  subtitle,
  steps = [],
  deadline,
  expiredText,
}: LpUrgencyProps) {
  const hasContent = !!(label || title || subtitle || steps.length > 0 || deadline);
  const deadlineMs = deadline ? Date.parse(deadline) : NaN;
  const hasValidDeadline = Number.isFinite(deadlineMs);

  // Defer countdown computation to the client to avoid SSR/CSR hydration drift.
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    if (!hasValidDeadline) return;
    setRemaining(computeRemaining(deadlineMs));
    const id = setInterval(() => setRemaining(computeRemaining(deadlineMs)), 1000);
    return () => clearInterval(id);
  }, [deadlineMs, hasValidDeadline]);

  if (!hasContent) return null;

  const showCountdown = hasValidDeadline && remaining && !remaining.expired;
  const showExpired = hasValidDeadline && remaining && remaining.expired;

  return (
    <section className="bg-luxury-charcoal text-white section-padding">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        {/* Left: header + steps */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
        >
          {label && <p className="luxury-label mb-4">{label}</p>}
          {title && (
            <h2 className="luxury-subheading mb-4">{title}</h2>
          )}
          {subtitle && (
            <p className="text-white/70 font-light leading-relaxed mb-8">
              {subtitle}
            </p>
          )}
          {(label || title || subtitle) && <div className="luxury-divider mb-10" />}

          {steps.length > 0 && (
            <ol className="space-y-6">
              {steps.map((step, i) => (
                <motion.li
                  key={i}
                  className="relative pl-16"
                  initial={{ y: 16, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {step.iconImage ? (
                    // When a picto is set we drop the italic number and show the
                    // image at roughly the same footprint so titles still align.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={step.iconImage}
                      alt=""
                      className="absolute left-0 top-0 w-10 h-10 object-contain"
                    />
                  ) : (
                    <span className="absolute left-0 top-0 font-serif text-4xl text-luxury-gold leading-none italic">
                      {pad(i + 1)}
                    </span>
                  )}
                  {step.title && (
                    <h3 className="font-serif text-lg text-white mb-2">
                      {step.title}
                    </h3>
                  )}
                  {step.text && (
                    <p className="text-sm text-white/70 font-light leading-relaxed">
                      {step.text}
                    </p>
                  )}
                </motion.li>
              ))}
            </ol>
          )}
        </motion.div>

        {/* Right: countdown */}
        {hasValidDeadline && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <p className="luxury-label mb-6">Plus que</p>
            {showCountdown && remaining && (
              <div className="grid grid-cols-4 gap-3 sm:gap-5 w-full max-w-md">
                <CountdownCell value={remaining.days} label="Jours" />
                <CountdownCell value={remaining.hours} label="Heures" />
                <CountdownCell value={remaining.minutes} label="Min." />
                <CountdownCell value={remaining.seconds} label="Sec." />
              </div>
            )}
            {!remaining && (
              // Reserve roughly the same space as the ticking countdown so the
              // section doesn't visibly jump once the client mounts and the
              // first interval tick replaces this placeholder.
              <div className="grid grid-cols-4 gap-3 sm:gap-5 w-full max-w-md">
                <CountdownCell value={0} label="Jours" />
                <CountdownCell value={0} label="Heures" />
                <CountdownCell value={0} label="Min." />
                <CountdownCell value={0} label="Sec." />
              </div>
            )}
            {showExpired && (
              <p className="font-serif text-2xl text-luxury-gold italic mt-4 text-center">
                {expiredText || "L'offre est terminée"}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function CountdownCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/5 border border-white/10 px-2 py-5 sm:py-6 text-center">
      <p className="font-serif text-4xl sm:text-5xl text-luxury-champagne tabular-nums">
        {pad(value)}
      </p>
      <p className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/60">
        {label}
      </p>
    </div>
  );
}
