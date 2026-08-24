import Link from "next/link";

const LINKEDIN_GENERATOR_URL = "https://snapdesk-claudio-linkedin.vercel.app/";
const STARTUP_MAP_URL = "https://cartestartups.vercel.app/";
const EMAIL_GENERATOR_URL = "https://mail-leads-hebdo.vercel.app/";

interface HubLink {
  label: string;
  href: string;
  newTab?: boolean;
  soon?: boolean;
}

interface HubSection {
  index: string;
  title: string;
  description: string;
  links: HubLink[];
}

const SECTIONS: HubSection[] = [
  {
    index: "01",
    title: "Commercialisation",
    description: "Espaces, dossiers de présentation et rapports mensuels de commercialisation.",
    links: [{ label: "Espaces & rapports", href: "/admin" }],
  },
  {
    index: "02",
    title: "Outils marketing",
    description: "Générez du contenu et des pages pour vos campagnes marketing.",
    links: [
      { label: "Générateur LinkedIn", href: LINKEDIN_GENERATOR_URL, newTab: true },
      { label: "Landing Pages", href: "/admin/lp" },
      { label: "Carte des startups", href: STARTUP_MAP_URL, newTab: true },
      { label: "Générateur d'emails", href: EMAIL_GENERATOR_URL, newTab: true },
    ],
  },
  {
    index: "03",
    title: "Brokers",
    description: "Annuaire public des brokers et mini-sites de présentation par espace.",
    links: [{ label: "Annuaire brokers", href: "/espaces", newTab: true }],
  },
];

export default function HubPage() {
  return (
    <main className="min-h-screen bg-luxury-cream">
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-16 pb-10 text-center">
        <p className="luxury-label mb-3">Snapdesk</p>
        <h1 className="font-serif text-3xl md:text-4xl text-luxury-charcoal">
          Que souhaitez-vous faire&nbsp;?
        </h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 pb-20 grid gap-6 md:grid-cols-3">
        {SECTIONS.map((section) => (
          <div key={section.title} className="luxury-card flex flex-col">
            <p className="luxury-label mb-2">{section.index}</p>
            <h2 className="font-serif text-2xl text-luxury-charcoal mb-3">{section.title}</h2>
            <p className="text-sm text-luxury-slate leading-relaxed mb-6 flex-1">
              {section.description}
            </p>

            <div className="flex flex-col gap-2">
              {section.links.map((link) =>
                link.soon ? (
                  <span
                    key={link.label}
                    className="px-4 py-2.5 text-sm text-center border border-dashed border-primary-200 text-luxury-slate/40 rounded"
                  >
                    {link.label}
                  </span>
                ) : link.newTab ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-sm text-center border border-primary-200 text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white transition-colors rounded"
                  >
                    {link.label}
                    <span aria-hidden="true" className="ml-1.5 text-xs">↗</span>
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="px-4 py-2.5 text-sm text-center border border-primary-200 text-luxury-charcoal hover:bg-luxury-charcoal hover:text-white transition-colors rounded"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
