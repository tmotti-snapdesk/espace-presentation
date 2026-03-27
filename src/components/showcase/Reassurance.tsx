"use client";

import { motion } from "framer-motion";

export default function Reassurance() {
  const stats = [
    { value: "90+", label: "Clients satisfaits" },
    { value: "150+", label: "Espaces gérés" },
    { value: "8 ans", label: "D'expertise" },
    { value: "100%", label: "Sur-mesure" },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="luxury-label mb-4">À propos</p>
            <h2 className="luxury-heading text-luxury-charcoal mb-6">
              Snapdesk,<br />
              <span className="text-luxury-gold italic">l&apos;excellence</span><br />
              au service de<br />
              vos bureaux
            </h2>
            <div className="luxury-divider mb-8" />
            <p className="text-luxury-slate leading-relaxed mb-6 font-light text-lg">
              Snapdesk accompagne les entreprises dans la recherche et
              l&apos;aménagement de leurs espaces de travail. Notre expertise et
              notre réseau nous permettent de vous proposer les meilleurs
              espaces, adaptés à vos besoins et à votre culture d&apos;entreprise.
            </p>
            <p className="text-luxury-slate leading-relaxed font-light text-lg">
              Avec plus de 90 clients qui nous font confiance, nous mettons
              notre savoir-faire à votre service pour vous offrir une
              expérience de bureaux sans compromis.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="luxury-card text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              >
                <p className="text-4xl md:text-5xl font-serif text-luxury-gold mb-3">
                  {stat.value}
                </p>
                <p className="text-sm uppercase tracking-wider text-luxury-slate">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-primary-100 text-center">
        <p className="text-luxury-gold font-serif text-2xl italic mb-2">Snapdesk</p>
        <p className="text-sm text-luxury-slate">
          L&apos;excellence au service de vos espaces de travail
        </p>
      </div>
    </section>
  );
}
