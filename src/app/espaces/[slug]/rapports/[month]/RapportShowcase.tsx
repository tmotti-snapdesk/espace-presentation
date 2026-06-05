"use client";

import { RapportData } from "@/types/rapport";
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
}

export default function RapportShowcase({ rapport }: RapportShowcaseProps) {
  const upcomingActions = rapport.upcomingActions || [];
  const hidden = new Set(rapport.hiddenSections || []);
  const isVisible = (id: string) => !hidden.has(id);

  const sommaire = [
    { id: "marketing", label: "Marketing", show: true },
    { id: "prospection", label: "Actions menées", show: rapport.prospectionActions.length > 0 },
    { id: "actions-a-venir", label: "Actions à venir", show: upcomingActions.length > 0 },
    { id: "visites", label: "Comptes rendus de visite", show: rapport.visites.length > 0 },
    { id: "preconisations", label: "Nos préconisations", show: rapport.recommendations.length > 0 },
    { id: "similaires", label: "Espaces similaires", show: rapport.similarEspaces.length > 0 },
  ]
    .filter((s) => s.show && isVisible(s.id))
    .map(({ id, label }) => ({ id, label }));

  return (
    <main className="rapport-printable">
      <RapportHero
        espaceName={rapport.espaceName}
        espaceAddress={rapport.espaceAddress}
        month={rapport.month}
        marketingStartDate={rapport.marketingStartDate}
        ownerName={rapport.ownerName}
        presentationUrl={rapport.presentationUrl || ""}
      />
      <RapportSommaire items={sommaire} />
      {isVisible("intro") && <RapportIntro intro={rapport.intro} />}
      {isVisible("marketing") && (
        <RapportMarketing
          monthlyBudget={rapport.monthlyBudget}
          targetedEmailingCount={rapport.targetedEmailingCount}
          matchingFormsCount={rapport.matchingFormsCount}
          preselectionCount={rapport.preselectionCount}
          brokersListingActive={rapport.brokersListingActive}
          brokersListingCount={rapport.brokersListingCount}
          distribution={rapport.distribution}
          otherMarketingActions={rapport.otherMarketingActions}
          showKpis={isVisible("marketing.kpis")}
          showDistribution={isVisible("marketing.distribution")}
          showOther={isVisible("marketing.other")}
        />
      )}
      {isVisible("prospection") && (
        <RapportProspection prospectionActions={rapport.prospectionActions} />
      )}
      {isVisible("actions-a-venir") && (
        <RapportUpcoming upcomingActions={upcomingActions} />
      )}
      {isVisible("visites") && (
        <RapportVisites
          visites={rapport.visites}
          anonymizeProspects={rapport.anonymizeVisitProspects}
        />
      )}
      {isVisible("preconisations") && (
        <RapportRecommendations recommendations={rapport.recommendations} />
      )}
      {isVisible("similaires") && (
        <RapportSimilarEspaces similarEspaces={rapport.similarEspaces} />
      )}
      <RapportFooter espaceName={rapport.espaceName} />
    </main>
  );
}
