"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { EspaceData } from "@/types/espace";
import type { LandingPageData } from "@/types/lp";

interface Lead {
  // dynamic HubSpot fields (email, firstname, …) at the root
  [key: string]: unknown;
  searchingForOffice?: boolean;
  espaceName?: string;
  espaceSlug?: string;
  source?: string;
  utm?: string;
  createdAt?: string;
}

type SourceKind = "espace" | "lp" | "unknown";

interface ResolvedLead {
  lead: Lead;
  kind: SourceKind;
  sourceLabel: string;
  sourceHref?: string;
  adminHref?: string;
}

const META_KEYS = new Set([
  "espaceName",
  "espaceSlug",
  "source",
  "utm",
  "createdAt",
  "searchingForOffice",
]);

// Fields shown as dedicated table columns when present. Anything else
// the visitor filled in is rendered in the expanded detail panel.
const PRIMARY_FIELDS: { key: string; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "firstname", label: "Prénom" },
  { key: "lastname", label: "Nom" },
  { key: "company", label: "Entreprise" },
  { key: "phone", label: "Téléphone" },
];

function getStr(lead: Lead, key: string): string {
  const v = lead[key];
  return typeof v === "string" ? v : "";
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [espaces, setEspaces] = useState<EspaceData[]>([]);
  const [lps, setLps] = useState<LandingPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kindFilter, setKindFilter] = useState<"all" | SourceKind>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/leads").then((r) => (r.ok ? r.json() : Promise.reject(r))),
      fetch("/api/espaces").then((r) => (r.ok ? r.json() : { espaces: [] })),
      fetch("/api/lp").then((r) => (r.ok ? r.json() : { lps: [] })),
    ])
      .then(([leadsRes, espacesRes, lpsRes]) => {
        const list: Lead[] = Array.isArray(leadsRes.leads) ? leadsRes.leads : [];
        list.sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        setLeads(list);
        setEspaces(Array.isArray(espacesRes.espaces) ? espacesRes.espaces : []);
        setLps(Array.isArray(lpsRes.lps) ? lpsRes.lps : []);
      })
      .catch(() => setError("Impossible de charger les leads."))
      .finally(() => setLoading(false));
  }, []);

  // Resolve each lead's origin: a slug may match either an espace or an LP
  // (LP forms reuse the `espaceSlug` field). LP wins when both exist with
  // the same slug since LP-without-espace is the explicit case we want to
  // make visible.
  const resolved: ResolvedLead[] = useMemo(() => {
    const espaceBySlug = new Map(espaces.map((e) => [e.slug, e]));
    const lpBySlug = new Map(lps.map((l) => [l.slug, l]));
    return leads.map((lead) => {
      const slug = getStr(lead, "espaceSlug");
      const lp = slug ? lpBySlug.get(slug) : undefined;
      const espace = slug ? espaceBySlug.get(slug) : undefined;
      if (lp) {
        return {
          lead,
          kind: "lp",
          sourceLabel: lp.internalTitle || slug,
          sourceHref: `/lp/${slug}`,
          adminHref: `/admin/lp/${slug}`,
        };
      }
      if (espace) {
        return {
          lead,
          kind: "espace",
          sourceLabel: espace.name || slug,
          sourceHref: `/espaces/${slug}`,
          adminHref: `/admin/${slug}`,
        };
      }
      return {
        lead,
        kind: "unknown",
        sourceLabel: getStr(lead, "espaceName") || slug || "—",
        sourceHref: getStr(lead, "source") || undefined,
      };
    });
  }, [leads, espaces, lps]);

  const sourceOptions = useMemo(() => {
    const map = new Map<string, { slug: string; label: string; kind: SourceKind }>();
    for (const r of resolved) {
      const slug = getStr(r.lead, "espaceSlug") || "__none__";
      if (!map.has(slug)) {
        map.set(slug, { slug, label: r.sourceLabel || slug, kind: r.kind });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [resolved]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resolved.filter((r) => {
      if (kindFilter !== "all" && r.kind !== kindFilter) return false;
      if (sourceFilter !== "all") {
        const slug = getStr(r.lead, "espaceSlug") || "__none__";
        if (slug !== sourceFilter) return false;
      }
      if (q) {
        const hay = Object.entries(r.lead)
          .filter(([k]) => !META_KEYS.has(k))
          .map(([, v]) => (typeof v === "string" ? v : ""))
          .join(" ")
          .toLowerCase();
        const sourceHay = r.sourceLabel.toLowerCase();
        if (!hay.includes(q) && !sourceHay.includes(q)) return false;
      }
      return true;
    });
  }, [resolved, kindFilter, sourceFilter, search]);

  const counts = useMemo(() => {
    let espace = 0;
    let lp = 0;
    let unknown = 0;
    for (const r of resolved) {
      if (r.kind === "espace") espace++;
      else if (r.kind === "lp") lp++;
      else unknown++;
    }
    return { total: resolved.length, espace, lp, unknown };
  }, [resolved]);

  const exportCsv = () => {
    const extraKeys = new Set<string>();
    for (const r of filtered) {
      for (const k of Object.keys(r.lead)) {
        if (!META_KEYS.has(k) && !PRIMARY_FIELDS.some((p) => p.key === k)) {
          extraKeys.add(k);
        }
      }
    }
    const headers = [
      "createdAt",
      "type",
      "source_slug",
      "source_label",
      ...PRIMARY_FIELDS.map((p) => p.key),
      ...Array.from(extraKeys),
      "searchingForOffice",
      "page_url",
      "utm",
    ];
    const rows = filtered.map((r) => {
      const row: Record<string, string> = {
        createdAt: getStr(r.lead, "createdAt"),
        type: r.kind,
        source_slug: getStr(r.lead, "espaceSlug"),
        source_label: r.sourceLabel,
        searchingForOffice: r.lead.searchingForOffice ? "true" : "false",
        page_url: getStr(r.lead, "source"),
        utm: getStr(r.lead, "utm"),
      };
      for (const p of PRIMARY_FIELDS) row[p.key] = getStr(r.lead, p.key);
      extraKeys.forEach((k) => {
        row[k] = getStr(r.lead, k);
      });
      return row;
    });
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((h) => csvEscape(row[h] ?? "")).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-luxury-cream">
      <div className="bg-luxury-charcoal text-white py-8 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="luxury-label text-luxury-gold mb-1">Snapdesk</p>
            <h1 className="font-serif text-2xl">Leads</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-white/60 text-sm hover:text-white transition-colors">
              Espaces
            </Link>
            <Link href="/admin/lp" className="text-white/60 text-sm hover:text-white transition-colors">
              Landing Pages
            </Link>
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="luxury-btn text-sm disabled:opacity-50"
            >
              Exporter CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-10 px-6 md:px-12">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-luxury-slate">Chargement...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total" value={counts.total} active={kindFilter === "all"} onClick={() => setKindFilter("all")} />
              <StatCard label="Espaces" value={counts.espace} active={kindFilter === "espace"} onClick={() => setKindFilter("espace")} />
              <StatCard label="Landing Pages" value={counts.lp} active={kindFilter === "lp"} onClick={() => setKindFilter("lp")} />
              <StatCard label="Source inconnue" value={counts.unknown} active={kindFilter === "unknown"} onClick={() => setKindFilter("unknown")} />
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <input
                type="search"
                placeholder="Rechercher (email, nom, entreprise…)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 text-sm bg-white border border-primary-200 rounded focus:outline-none focus:border-luxury-charcoal"
              />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-4 py-2 text-sm bg-white border border-primary-200 rounded focus:outline-none focus:border-luxury-charcoal"
              >
                <option value="all">Toutes les sources</option>
                {sourceOptions.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    [{s.kind === "lp" ? "LP" : s.kind === "espace" ? "Espace" : "?"}] {s.label}
                  </option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white border border-primary-100 rounded">
                <p className="text-luxury-slate">Aucun lead ne correspond aux filtres.</p>
              </div>
            ) : (
              <div className="bg-white border border-primary-100 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-primary-50 text-luxury-slate">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                      <th className="text-left px-4 py-3 font-medium">Source</th>
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Nom</th>
                      <th className="text-left px-4 py-3 font-medium">Entreprise</th>
                      <th className="text-left px-4 py-3 font-medium">Téléphone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, idx) => {
                      const isOpen = expanded === idx;
                      const fullName = [getStr(r.lead, "firstname"), getStr(r.lead, "lastname")]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <Fragment key={idx}>
                          <tr
                            className="border-t border-primary-100 hover:bg-primary-50/40 cursor-pointer"
                            onClick={() => setExpanded(isOpen ? null : idx)}
                          >
                            <td className="px-4 py-3 text-luxury-slate whitespace-nowrap">
                              {formatDate(getStr(r.lead, "createdAt"))}
                            </td>
                            <td className="px-4 py-3">
                              <SourceBadge kind={r.kind} label={r.sourceLabel} />
                            </td>
                            <td className="px-4 py-3 font-mono text-luxury-charcoal">
                              {getStr(r.lead, "email") || "—"}
                            </td>
                            <td className="px-4 py-3">{fullName || "—"}</td>
                            <td className="px-4 py-3">{getStr(r.lead, "company") || "—"}</td>
                            <td className="px-4 py-3">{getStr(r.lead, "phone") || "—"}</td>
                          </tr>
                          {isOpen && (
                            <tr className="border-t border-primary-100 bg-primary-50/30">
                              <td colSpan={6} className="px-4 py-4">
                                <LeadDetail resolved={r} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-xs text-luxury-slate/60 mt-4">
              {filtered.length} lead{filtered.length > 1 ? "s" : ""} affiché
              {filtered.length > 1 ? "s" : ""} sur {counts.total}. Les données proviennent
              du backup Vercel Blob. Le suivi complet (statuts, relances) reste sur HubSpot.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded border transition-colors ${
        active
          ? "bg-luxury-charcoal text-white border-luxury-charcoal"
          : "bg-white border-primary-100 hover:border-primary-300"
      }`}
    >
      <p className={`text-xs uppercase tracking-wider mb-1 ${active ? "text-luxury-gold" : "text-luxury-slate"}`}>
        {label}
      </p>
      <p className="font-serif text-2xl">{value}</p>
    </button>
  );
}

function SourceBadge({ kind, label }: { kind: SourceKind; label: string }) {
  const styles =
    kind === "lp"
      ? "bg-luxury-gold/15 text-luxury-charcoal border-luxury-gold/40"
      : kind === "espace"
      ? "bg-primary-100 text-luxury-charcoal border-primary-200"
      : "bg-red-50 text-red-600 border-red-200";
  const tag = kind === "lp" ? "LP" : kind === "espace" ? "Espace" : "?";
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${styles}`}>
        {tag}
      </span>
      <span className="truncate max-w-[14rem]" title={label}>
        {label}
      </span>
    </span>
  );
}

function LeadDetail({ resolved }: { resolved: ResolvedLead }) {
  const { lead, sourceHref, adminHref } = resolved;
  const extraEntries = Object.entries(lead).filter(([k, v]) => {
    if (META_KEYS.has(k)) return false;
    if (PRIMARY_FIELDS.some((p) => p.key === k)) return false;
    return typeof v === "string" && v.length > 0;
  });

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <p className="luxury-label text-luxury-slate mb-2">Champs du formulaire</p>
        <dl className="space-y-1">
          {PRIMARY_FIELDS.map((p) => {
            const v = getStr(lead, p.key);
            if (!v) return null;
            return (
              <div key={p.key} className="flex gap-2 text-sm">
                <dt className="text-luxury-slate min-w-[120px]">{p.label}</dt>
                <dd className="text-luxury-charcoal break-words">{v}</dd>
              </div>
            );
          })}
          {extraEntries.map(([k, v]) => (
            <div key={k} className="flex gap-2 text-sm">
              <dt className="text-luxury-slate min-w-[120px] font-mono text-xs">{k}</dt>
              <dd className="text-luxury-charcoal break-words">{String(v)}</dd>
            </div>
          ))}
          {lead.searchingForOffice ? (
            <div className="flex gap-2 text-sm">
              <dt className="text-luxury-slate min-w-[120px]">Recherche active</dt>
              <dd className="text-luxury-charcoal">Oui</dd>
            </div>
          ) : null}
        </dl>
      </div>
      <div>
        <p className="luxury-label text-luxury-slate mb-2">Contexte</p>
        <dl className="space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-luxury-slate min-w-[120px]">Source</dt>
            <dd className="text-luxury-charcoal break-all">
              {sourceHref ? (
                <a href={sourceHref} target="_blank" rel="noopener noreferrer" className="underline">
                  {sourceHref}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          {adminHref && (
            <div className="flex gap-2">
              <dt className="text-luxury-slate min-w-[120px]">Admin</dt>
              <dd>
                <Link href={adminHref} className="underline text-luxury-charcoal">
                  Ouvrir dans l&apos;admin
                </Link>
              </dd>
            </div>
          )}
          {getStr(lead, "utm") && (
            <div className="flex gap-2">
              <dt className="text-luxury-slate min-w-[120px]">UTM</dt>
              <dd className="text-luxury-charcoal break-all font-mono text-xs">
                {getStr(lead, "utm")}
              </dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="text-luxury-slate min-w-[120px]">Reçu le</dt>
            <dd className="text-luxury-charcoal">{formatDate(getStr(lead, "createdAt"))}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
