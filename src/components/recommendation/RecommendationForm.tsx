"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./reco.module.css";

export type RecommendationContact = {
  name: string;
  email: string;
  phone: string;
  relationship: string;
};

export type RecommendationPayload = {
  sender: { name: string; email: string; phone?: string };
  contacts: RecommendationContact[];
  needs: string[];
  note: string;
  source: string;
  submittedAt: string;
  googleReviewOpened?: boolean;
};

type Props = {
  source: string;
  showSenderPhone?: boolean;
  requireSenderEmail?: boolean;
  googleReviewOpened?: boolean;
  onSuccess: () => void;
};

const NEEDS = [
  { value: "poste-flex", label: "Poste flex" },
  { value: "bureau-prive", label: "Bureau privé" },
  { value: "salle-reunion", label: "Salle de réunion" },
  { value: "domiciliation", label: "Domiciliation" },
  { value: "autre", label: "Autre" },
];

type ContactDraft = RecommendationContact & { id: number };

let contactCounter = 0;
const newContact = (): ContactDraft => ({
  id: ++contactCounter,
  name: "",
  email: "",
  phone: "",
  relationship: "",
});

export default function RecommendationForm({
  source,
  showSenderPhone = false,
  requireSenderEmail = false,
  googleReviewOpened,
  onSuccess,
}: Props) {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [note, setNote] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [contacts, setContacts] = useState<ContactDraft[]>(() => [newContact()]);
  const [leavingId, setLeavingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const removeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (removeTimeout.current) clearTimeout(removeTimeout.current);
    };
  }, []);

  const updateContact = (id: number, field: keyof RecommendationContact, value: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const addContact = () => {
    setContacts((prev) => [...prev, newContact()]);
  };

  const removeContact = (id: number) => {
    setLeavingId(id);
    if (removeTimeout.current) clearTimeout(removeTimeout.current);
    removeTimeout.current = setTimeout(() => {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setLeavingId(null);
    }, 200);
  };

  const toggleNeed = (value: string) => {
    setNeeds((prev) =>
      prev.includes(value) ? prev.filter((n) => n !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: RecommendationPayload = {
      sender: {
        name: senderName.trim(),
        email: senderEmail.trim(),
        ...(showSenderPhone ? { phone: senderPhone.trim() } : {}),
      },
      contacts: contacts
        .filter((c) => c.name.trim())
        .map(({ name, email, phone, relationship }) => ({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          relationship: relationship.trim(),
        })),
      needs,
      note: note.trim(),
      source,
      submittedAt: new Date().toISOString(),
      ...(googleReviewOpened !== undefined ? { googleReviewOpened } : {}),
    };

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(
        "Oups, l'envoi n'a pas marché. Réessayez ou contactez-nous à contact@snapdesk.fr"
      );
      setSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-[18px] mt-2" onSubmit={handleSubmit}>
      <Field label="Vous êtes" htmlFor="senderName">
        <input
          id="senderName"
          type="text"
          required
          placeholder="Prénom Nom"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field
        label="Votre email"
        optional={
          requireSenderEmail ? "(pour vous verser le bonus)" : "(pour vous tenir au courant)"
        }
        htmlFor="senderEmail"
      >
        <input
          id="senderEmail"
          type="email"
          required={requireSenderEmail}
          placeholder="vous@exemple.com"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          className={inputCls}
        />
      </Field>

      {showSenderPhone && (
        <Field
          label="Votre téléphone"
          optional="(optionnel, pour vous joindre vite)"
          htmlFor="senderPhone"
        >
          <input
            id="senderPhone"
            type="tel"
            placeholder="06 12 34 56 78"
            value={senderPhone}
            onChange={(e) => setSenderPhone(e.target.value)}
            className={inputCls}
          />
        </Field>
      )}

      <div>
        {contacts.map((c, idx) => (
          <div
            key={c.id}
            className={`bg-reco-elev border border-reco-line rounded-[22px] p-[18px] flex flex-col gap-[14px] mb-3 ${
              styles.contactBlock
            } ${leavingId === c.id ? styles.contactBlockLeaving : ""}`}
          >
            <div className="flex justify-between items-center">
              <span className={`${styles.fraunces} font-medium text-[15px] text-reco-ink`}>
                Personne {idx + 1}
              </span>
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => removeContact(c.id)}
                  className="bg-transparent border-0 text-reco-ink-faint hover:text-reco-accent text-[13px] px-2 py-1 rounded cursor-pointer transition-colors"
                >
                  Retirer
                </button>
              )}
            </div>

            <Field label="Son nom">
              <input
                type="text"
                required
                placeholder="Prénom Nom"
                value={c.name}
                onChange={(e) => updateContact(c.id, "name", e.target.value)}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Email" optional="(ou tél.)">
                <input
                  type="email"
                  placeholder="email@exemple.com"
                  value={c.email}
                  onChange={(e) => updateContact(c.id, "email", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Téléphone" optional="(optionnel)">
                <input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={c.phone}
                  onChange={(e) => updateContact(c.id, "phone", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Comment vous le/la connaissez" optional="(optionnel)">
              <input
                type="text"
                placeholder="Ex : voisin de bureau, ancien collègue…"
                value={c.relationship}
                onChange={(e) => updateContact(c.id, "relationship", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addContact}
        className="bg-transparent border-[1.5px] border-dashed border-reco-line text-reco-ink-soft rounded-[22px] py-4 text-[14px] cursor-pointer transition-all hover:border-reco-ink hover:border-solid hover:text-reco-ink flex items-center justify-center gap-1.5"
      >
        + Ajouter une autre personne
      </button>

      <Field label="Type de besoin" optional="(optionnel)">
        <div className="flex flex-wrap gap-2">
          {NEEDS.map((n) => {
            const selected = needs.includes(n.value);
            return (
              <button
                key={n.value}
                type="button"
                onClick={() => toggleNeed(n.value)}
                className={`rounded-full px-[14px] py-[9px] text-[13px] cursor-pointer transition-all border ${
                  selected
                    ? "bg-reco-ink text-reco-bg border-reco-ink"
                    : "bg-reco-elev text-reco-ink-soft border-reco-line hover:border-reco-ink-soft"
                }`}
              >
                {n.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="Un petit mot pour nous"
        optional="(contexte, urgence, etc.)"
        htmlFor="note"
      >
        <textarea
          id="note"
          placeholder="Ex : 'Marie cherche un bureau pour 4 personnes à Lyon, elle déménage en juin'"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${inputCls} resize-y min-h-[90px]`}
        />
      </Field>

      {error && (
        <p className="text-reco-accent-deep text-[14px]" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2.5 mt-3">
        <button
          type="submit"
          disabled={submitting}
          className={`${btnPrimaryCls} ${styles.btnPrimary}`}
        >
          {submitting ? "Envoi…" : "Envoyer la recommandation"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full bg-reco-elev border border-reco-line rounded-[14px] px-[14px] py-[13px] text-base text-reco-ink transition-all appearance-none placeholder:text-reco-ink-faint " +
  styles.input;

const btnPrimaryCls =
  "bg-reco-ink text-reco-bg border-0 rounded-full px-7 py-4 text-[15px] font-medium cursor-pointer transition-all inline-flex items-center justify-center gap-2 w-full tracking-[0.01em] disabled:opacity-50 disabled:cursor-not-allowed";

function Field({
  label,
  optional,
  htmlFor,
  children,
}: {
  label: string;
  optional?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-reco-ink">
        {label}
        {optional && (
          <span className="text-reco-ink-faint font-normal ml-1">{optional}</span>
        )}
      </label>
      {children}
    </div>
  );
}

export { btnPrimaryCls };
