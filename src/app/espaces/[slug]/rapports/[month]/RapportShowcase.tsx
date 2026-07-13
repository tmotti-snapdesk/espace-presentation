"use client";

import { useState } from "react";
import { RapportData, formatMonthLabel, sortMonthsDesc } from "@/types/rapport";
import RapportHero from "@/components/rapport/RapportHero";
import RapportSommaire from "@/components/rapport/RapportSommaire";
import RapportIntro from "@/components/rapport/RapportIntro";
import RapportMarketing from "@/components/rapport/RapportMarketing";
import RapportProspection from "@/components/rapport/RapportProspection";
import RapportUpcoming from "@/components/rapport/RapportUpcoming";
import RapportVisites from "@/components/rapport/RapportVisites";
import RapportRecommendations from "@/components/rapport/RapportRecommendations";
import RapportSimilarEspaces from "@/components/rapport/RapportSimilarEspaces";
import RapportFooter from "@/components/rapport/RapportFooter";

interface RapportShowcaseProps {
  rapport: RapportData;
  initialMonth: string;
}

export default function RapportShowcase({ rapport, initialMonth }: RapportShowcaseProps) {
  const months = sortMonthsDesc(rapport.months);
  const [activeMonth, setActiveMonth] = useState(
    months.find((m) => m.month === initialMonth)?.month || months[0]?.month || ""
  );

  const month = months.find((m) => m.month === activeMonth) || months[0];

  const upcomingActions = month?.upcomingActions || [];
  const visites = (month?.visites || []).filter((v) => v.status !== "pending");
  const hidden = new Set(rapport.hiddenSections || []);
  const isVisible = (id: string) => !hidden.has(id);

  const sommaire = [
    { id: "marketing", label: "Investissements & diffusion", show: true },
    { id: "prospection", label: "Dernières actions menées", show: (month?.prospectionActions.length || 0) > 0 },
    { id: "actions-a-venir", label: "Actions à venir", show: upcomingActions.length > 0 },
    { id: "preconisations", label: "Nos préconisations", show: rapport.recommendations.length > 0 },
    { id: "visites", label: "Visites du mois", show: visites.length > 0 },
    { id: "similaires", label: "Espaces similaires", show: rapport.similarEspaces.length > 0 },
  ]
    .filter((s) => s.show && isVisible(s.id))
    .map(({ id, label }) => ({ id, label }));

  if (!month) {
    return (
      <main className="rapport-printable">
        <p className="p-12 text-center text-luxury-slate">Aucune donnée pour ce rapport.</p>
      </main>
    );
  }

  return (
    <main className="rapport-printable">
      <RapportHero
        espaceName={rapport.espaceName}
        espaceAddress={rapport.espaceAddress}
        month={month.month}
        marketingStartDate={rapport.marketingStartDate}
        ownerName={rapport.ownerName}
        presentationUrl={rapport.presentationUrl || ""}
      />
      <RapportSommaire items={sommaire} />

      {/* En quelques mots : global, indépendant du mois sélectionné */}
      {isVisible("intro") && <RapportIntro intro={rapport.intro} />}

      {/* Bloc mensuel : onglets puis détail du mois sélectionné */}
      {months.length > 1 && (
        <div className="no-print bg-white border-b border-primary-100">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-4 flex flex-wrap gap-2">
            {months.map((m) => (
              <button
                key={m.month}
                type="button"
                onClick={() => setActiveMonth(m.month)}
                className={`px-4 py-2 text-sm rounded-full border transition-colors capitalize ${
                  m.month === activeMonth
                    ? "bg-luxury-charcoal text-white border-luxury-charcoal"
                    : "bg-white text-luxury-charcoal border-primary-200 hover:border-primary-300"
                }`}
              >
                {formatMonthLabel(m.month)}
              </button>
            ))}
          </div>
        </div>
      )}
      {isVisible("marketing") && (
        <RapportMarketing
          monthlyBudget={month.monthlyBudget}
          targetedEmailingCount={month.targetedEmailingCount}
          matchingFormsCount={month.matchingFormsCount}
          preselectionCount={month.preselectionCount}
          brokersListingActive={month.brokersListingActive}
          brokersListingCount={month.brokersListingCount}
          distribution={month.distribution}
          otherMarketingActions={month.otherMarketingActions}
          showKpis={isVisible("marketing.kpis")}
          showDistribution={isVisible("marketing.distribution")}
          showOther={isVisible("marketing.other")}
        />
      )}
      {isVisible("prospection") && (
        <RapportProspection prospectionActions={month.prospectionActions} />
      )}
      {isVisible("actions-a-venir") && (
        <RapportUpcoming upcomingActions={upcomingActions} />
      )}
      {isVisible("preconisations") && (
        <RapportRecommendations recommendations={rapport.recommendations} />
      )}
      {isVisible("visites") && (
        <RapportVisites
          visites={visites}
          anonymizeProspects={rapport.anonymizeVisitProspects}
        />
      )}

      {/* Espaces similaires : global, en clôture du rapport */}
      {isVisible("similaires") && (
        <RapportSimilarEspaces similarEspaces={rapport.similarEspaces} />
      )}
      <RapportFooter espaceName={rapport.espaceName} />
    </main>
  );
}
