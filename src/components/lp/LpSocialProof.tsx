"use client";

import { motion } from "framer-motion";
import { LpLogo } from "@/types/lp";

interface LpSocialProofProps {
  title?: string;
  logos?: LpLogo[];
  showGoogleRating?: boolean;
}

export default function LpSocialProof({ title, logos = [], showGoogleRating }: LpSocialProofProps) {
  // Defensive: tolerate a non-array payload (legacy / corrupted JSON) and
  // ignore any entry without a usable URL so the section never crashes
  // and never renders a broken <img>.
  const safeLogos = (Array.isArray(logos) ? logos : []).filter(
    (l): l is LpLogo => Boolean(l && typeof l.url === "string" && l.url.trim())
  );

  if (!title && !showGoogleRating && safeLogos.length === 0) return null;

  return (
    <section className="bg-luxury-cream section-padding">
      <div className="max-w-5xl mx-auto">
        {title && (
          <p className="luxury-label text-center mb-12">{title}</p>
        )}

        {showGoogleRating && (
          <motion.div
            className="flex justify-center mb-10"
            initial={{ y: 16 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
          >
            <GoogleRatingBadge />
          </motion.div>
        )}

        {safeLogos.length > 0 && (
          // Motion only shifts `y` — logos stay at full opacity so a
          // missed IntersectionObserver can't hide them.
          <motion.div
            className="flex flex-wrap items-center justify-center gap-10 md:gap-16"
            initial={{ y: 16 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6 }}
          >
            {safeLogos.map((logo, i) => (
              // Plain <img> — next/image with `fill` was unreliable for
              // Blob-hosted logos with varying aspect ratios. Since
              // unoptimized: true is set globally, there is no perf loss.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={logo.url}
                alt={logo.alt || ""}
                className="h-10 md:h-12 w-auto max-w-[160px] object-contain opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// Inline Google "G" + 4,8/5 rating with stars. Kept self-contained so the
// social-proof block can render the rating without any extra props.
function GoogleRatingBadge() {
  const rating = 4.8;
  const max = 5;

  return (
    <div className="inline-flex items-center gap-4 px-6 py-3 bg-white border border-primary-100 shadow-sm">
      <GoogleG className="w-6 h-6 shrink-0" />
      <div className="flex items-center gap-2">
        <Stars value={rating} max={max} />
        <span className="font-serif text-lg text-luxury-charcoal leading-none">
          {rating.toLocaleString("fr-FR")}/{max}
        </span>
      </div>
      <span className="luxury-label text-luxury-slate">Google</span>
    </div>
  );
}

function Stars({ value, max }: { value: number; max: number }) {
  // Render `max` stars and clip the gold overlay to `value/max` of the
  // width so a fractional rating like 4.8 shows a partially-filled fifth star.
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <div className="relative inline-block leading-none" aria-label={`Note ${value} sur ${max}`}>
      <div className="flex text-luxury-slate/30">
        {Array.from({ length: max }).map((_, i) => (
          <StarIcon key={i} />
        ))}
      </div>
      <div
        className="absolute inset-0 overflow-hidden text-luxury-gold"
        style={{ width: `${pct}%` }}
        aria-hidden
      >
        <div className="flex">
          {Array.from({ length: max }).map((_, i) => (
            <StarIcon key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4 fill-current"
      aria-hidden
    >
      <path d="M12 2.5l2.96 6 6.62.96-4.79 4.67 1.13 6.59L12 17.6l-5.92 3.12 1.13-6.59L2.42 9.46l6.62-.96L12 2.5z" />
    </svg>
  );
}

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.5 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
