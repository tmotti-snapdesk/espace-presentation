"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LpFormField } from "@/types/lp";
import { LEGACY_DEFAULT_FIELDS } from "@/lib/hubspotFieldCatalog";

interface LpLeadFormProps {
  title?: string;
  label?: string;
  ctaText?: string;
  hubspotFormId?: string;
  fields?: LpFormField[];
  lpSlug: string;
  lpTitle: string;
}

type FieldValue = string | boolean | string[];

function initialValueFor(field: LpFormField): FieldValue {
  if (field.type === "checkbox") return false;
  if (field.type === "multi-checkbox") return [];
  return "";
}

// Labels longer than this render above the input rather than as a
// placeholder — keeps long HubSpot questions readable without overflowing.
const INLINE_LABEL_MAX_LENGTH = 32;

// Number of consecutive rows revealed at once. Subsequent batches appear
// only after all required fields in the previous batches have been filled,
// so the visitor doesn't face a wall of inputs upfront.
const ROWS_PER_CHUNK = 3;

function isFieldFilled(field: LpFormField, value: FieldValue): boolean {
  if (field.type === "checkbox") return value === true;
  if (field.type === "multi-checkbox") return Array.isArray(value) && value.length > 0;
  return typeof value === "string" && value.trim() !== "";
}

export default function LpLeadForm({
  title,
  label,
  ctaText = "Envoyer ma demande",
  hubspotFormId,
  fields,
  lpSlug,
  lpTitle,
}: LpLeadFormProps) {
  const effectiveFields =
    fields && fields.length > 0 ? fields : LEGACY_DEFAULT_FIELDS;

  const [values, setValues] = useState<Record<string, FieldValue>>(() =>
    Object.fromEntries(effectiveFields.map((f) => [f.hubspotName, initialValueFor(f)]))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (name: string, value: FieldValue) =>
    setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Build the HubSpot fields payload from whatever the visitor filled in.
      // Empty strings are dropped to match HubSpot's expectations; checkboxes
      // are serialised as "true" / "false".
      const fieldsPayload = effectiveFields
        .map((f) => {
          const raw = values[f.hubspotName];
          if (f.type === "checkbox") {
            return { name: f.hubspotName, value: raw ? "true" : "false" };
          }
          if (f.type === "multi-checkbox") {
            // HubSpot expects multi-valued enumerations as ";"-separated strings.
            const arr = Array.isArray(raw) ? raw : [];
            return { name: f.hubspotName, value: arr.join(";") };
          }
          const str = typeof raw === "string" ? raw : "";
          return { name: f.hubspotName, value: str };
        })
        .filter((entry) => entry.value !== "");

      // Legacy boolean: any select flagged as `mapToSearchingForOffice` and
      // whose value starts with "Oui" flips `declare_etre_en_recherche`.
      const searchingForOffice = effectiveFields.some((f) => {
        if (!f.mapToSearchingForOffice) return false;
        const v = values[f.hubspotName];
        return typeof v === "string" && v.startsWith("Oui");
      });

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: fieldsPayload,
          searchingForOffice,
          espaceName: lpTitle,
          espaceSlug: lpSlug,
          hubspotFormId: hubspotFormId || undefined,
          source: typeof window !== "undefined" ? window.location.href : "",
          utm: typeof window !== "undefined" ? window.location.search : "",
          createdAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      setIsSubmitted(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-5 py-4 border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm bg-white";

  // Group consecutive `halfWidth` fields into rows of 2; full-width fields
  // (textareas, checkboxes, multi-checkboxes) sit on their own row.
  const isHalfEligible = (f: LpFormField) =>
    f.halfWidth &&
    f.type !== "textarea" &&
    f.type !== "checkbox" &&
    f.type !== "multi-checkbox";
  const rows: LpFormField[][] = [];
  for (const f of effectiveFields) {
    const last = rows[rows.length - 1];
    if (
      isHalfEligible(f) &&
      last &&
      last.length === 1 &&
      isHalfEligible(last[0])
    ) {
      last.push(f);
    } else {
      rows.push([f]);
    }
  }

  // Group rows into chunks revealed progressively. The visitor sees
  // ROWS_PER_CHUNK rows at a time; the next chunk reveals automatically
  // once every required field in the prior chunks is filled.
  const chunks: LpFormField[][][] = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_CHUNK) {
    chunks.push(rows.slice(i, i + ROWS_PER_CHUNK));
  }

  const [maxRevealedChunk, setMaxRevealedChunk] = useState(0);

  useEffect(() => {
    // Walk forward from the current frontier as long as the chunk we sit
    // on has all its required fields satisfied, then surface the next.
    // We never roll back: clearing a previously-filled field after the
    // form has expanded would feel jarring.
    setMaxRevealedChunk((prev) => {
      let candidate = prev;
      while (
        candidate < chunks.length - 1 &&
        chunks[candidate]
          .flat()
          .every((f) => !f.required || isFieldFilled(f, values[f.hubspotName]))
      ) {
        candidate++;
      }
      return candidate;
    });
  }, [values, chunks]);

  const allChunksRevealed = maxRevealedChunk >= chunks.length - 1;

  const renderField = (f: LpFormField) => {
    const value = values[f.hubspotName];
    // Long labels (typical of HubSpot questions) render above the input;
    // short labels stay inline as placeholders to keep the legacy compact look.
    const labelAbove = f.label.length > INLINE_LABEL_MAX_LENGTH;
    const placeholder = labelAbove ? "" : f.label;
    const requiredHint = f.required && labelAbove ? " *" : "";

    const wrap = (control: React.ReactNode) =>
      labelAbove ? (
        <div key={f.hubspotName}>
          <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-2 font-light">
            {f.label}{requiredHint}
          </label>
          {control}
        </div>
      ) : (
        <div key={f.hubspotName}>{control}</div>
      );

    if (f.type === "select") {
      return wrap(
        <select
          required={f.required}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => update(f.hubspotName, e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">{labelAbove ? "Sélectionner…" : f.label}</option>
          {(f.options || []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    }

    if (f.type === "textarea") {
      return wrap(
        <textarea
          required={f.required}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => update(f.hubspotName, e.target.value)}
          className={inputClass}
          placeholder={placeholder}
          rows={4}
        />
      );
    }

    if (f.type === "checkbox") {
      return (
        <label
          key={f.hubspotName}
          className="flex items-start gap-3 text-white/80 text-sm font-light cursor-pointer"
        >
          <input
            type="checkbox"
            required={f.required}
            checked={Boolean(value)}
            onChange={(e) => update(f.hubspotName, e.target.checked)}
            className="mt-1 w-4 h-4 accent-luxury-gold cursor-pointer"
          />
          <span>{f.label}</span>
        </label>
      );
    }

    if (f.type === "multi-checkbox") {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (option: string) => {
        const next = selected.includes(option)
          ? selected.filter((v) => v !== option)
          : [...selected, option];
        update(f.hubspotName, next);
      };
      return (
        <div key={f.hubspotName}>
          <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-3 font-light">
            {f.label}{f.required ? " *" : ""}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(f.options || []).map((o) => {
              const checked = selected.includes(o);
              return (
                <label
                  key={o}
                  className={`flex items-center gap-2 px-3 py-2 border text-sm cursor-pointer transition-colors ${
                    checked
                      ? "border-luxury-gold bg-luxury-gold/10 text-white"
                      : "border-primary-200/30 text-white/70 hover:border-luxury-gold/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(o)}
                    className="w-4 h-4 accent-luxury-gold cursor-pointer"
                  />
                  <span>{o}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    return wrap(
      <input
        type={f.type}
        required={f.required}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => update(f.hubspotName, e.target.value)}
        className={inputClass}
        placeholder={placeholder}
      />
    );
  };

  return (
    <section id="form" className="bg-luxury-charcoal section-padding">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          {label && <p className="luxury-label text-luxury-gold mb-4">{label}</p>}
          {title && (
            <motion.h2
              className="luxury-subheading text-white mb-2"
              initial={{ y: 20 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6 }}
            >
              {title}
            </motion.h2>
          )}
          <div className="luxury-divider mx-auto mt-6" />
        </div>

        {isSubmitted ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h3 className="font-serif text-2xl text-white mb-3">Merci !</h3>
            <p className="text-white/70 font-light">
              Nous avons bien reçu votre demande et reviendrons vers vous rapidement.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {chunks.map((chunkRows, chunkIdx) => {
              if (chunkIdx > maxRevealedChunk) return null;
              return chunkRows.map((row, rowIdx) => (
                <motion.div
                  key={`${chunkIdx}-${rowIdx}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.45, delay: rowIdx * 0.08, ease: "easeOut" }}
                  className={row.length === 2 ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : ""}
                >
                  {row.map(renderField)}
                </motion.div>
              ));
            })}

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            {allChunksRevealed && (
              <motion.button
                type="submit"
                disabled={isSubmitting}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className={`w-full px-8 py-5 bg-luxury-gold text-luxury-charcoal text-sm uppercase tracking-[0.15em] font-medium transition-all duration-300 hover:bg-luxury-champagne ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Envoi en cours..." : ctaText}
              </motion.button>
            )}

            <p className="text-center text-xs text-white/40 pt-2">
              Données traitées conformément à notre politique de confidentialité.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
