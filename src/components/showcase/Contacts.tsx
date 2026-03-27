"use client";

import { motion } from "framer-motion";

const CONTACTS = [
  {
    id: "manon",
    name: "Manon",
    role: "Chief Customer Officer",
    initials: "M",
  },
  {
    id: "roger",
    name: "Roger",
    role: "Responsable Maintenance Technique",
    initials: "R",
  },
];

export default function Contacts() {
  return (
    <section className="section-padding bg-luxury-cream">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Votre équipe</p>
          <h2 className="luxury-heading text-luxury-charcoal mb-4">
            Vos interlocuteurs
          </h2>
          <div className="luxury-divider mx-auto mb-6" />
          <p className="text-lg text-luxury-slate font-light">
            Une équipe dédiée pour vous accompagner
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {CONTACTS.map((contact, i) => (
            <motion.div
              key={contact.id}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-primary-100">
                <div className="w-full h-full flex items-center justify-center text-3xl font-serif text-luxury-gold">
                  {contact.initials}
                </div>
              </div>
              <h3 className="font-serif text-xl text-luxury-charcoal mb-1">
                {contact.name}
              </h3>
              <p className="text-sm text-luxury-gold uppercase tracking-wider mb-4">
                {contact.role}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
