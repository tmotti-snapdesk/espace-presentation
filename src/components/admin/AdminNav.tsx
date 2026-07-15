"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin", label: "Espaces" },
  { href: "/admin/lp", label: "Landing Pages" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/visites", label: "Visites à valider", showBadge: true },
];

const LINKEDIN_GENERATOR_URL = "https://snapdesk-claudio-linkedin.vercel.app/";

interface AdminNavProps {
  title: string;
  eyebrow?: string;
  maxWidth?: string;
  actions?: ReactNode;
}

export default function AdminNav({ title, eyebrow = "Snapdesk", maxWidth = "max-w-5xl", actions }: AdminNavProps) {
  const pathname = usePathname();
  const [pendingVisitesCount, setPendingVisitesCount] = useState(0);

  useEffect(() => {
    fetch("/api/visites?status=pending")
      .then((res) => (res.ok ? res.json() : { visites: [] }))
      .then((data) => setPendingVisitesCount(data.visites?.length || 0))
      .catch(() => {});
  }, []);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

  return (
    <header className="bg-luxury-charcoal text-white">
      <div className={`${maxWidth} mx-auto px-6 md:px-12 pt-8 pb-4 flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <p className="luxury-label text-luxury-gold mb-1">{eyebrow}</p>
          <h1 className="font-serif text-2xl">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-3 flex-wrap shrink-0">{actions}</div>}
      </div>

      <nav
        className={`${maxWidth} mx-auto px-6 md:px-12 flex items-center gap-1 flex-wrap border-t border-white/10 pt-3 pb-4 overflow-x-auto`}
        aria-label="Navigation admin"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`relative px-3 py-1.5 text-sm rounded whitespace-nowrap transition-colors ${
              isActive(link.href) ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {link.label}
            {link.showBadge && pendingVisitesCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[11px] rounded-full bg-luxury-gold text-luxury-charcoal font-medium">
                {pendingVisitesCount}
              </span>
            )}
          </Link>
        ))}

        <span className="w-px h-4 bg-white/15 mx-1 shrink-0" aria-hidden="true" />

        <a
          href={LINKEDIN_GENERATOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-sm rounded whitespace-nowrap text-white/60 hover:text-white hover:bg-white/10 transition-colors inline-flex items-center gap-1.5"
        >
          Générateur LinkedIn
          <span aria-hidden="true" className="text-xs">↗</span>
        </a>
      </nav>
    </header>
  );
}
