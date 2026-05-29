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
  const sommaire = [
    { id: "marketing", label: "Marketing", show: true },
    { id: "prospection", label: "Actions menées", show: rapport.prospectionActions.length > 0 },
    { id: "actions-a-venir", label: "Actions à venir", show: upcomingActions.length > 0 },
    { id: "visites", label: "Comptes rendus de visite", show: rapport.visites.length > 0 },
    { id: "preconisations", label: "Nos préconisations", show: rapport.recommendations.length > 0 },
    { id: "similaires", label: "Espaces similaires", show: rapport.similarEspaces.length > 0 },
  ]
    .filter((s) => s.show)
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
      <RapportIntro intro={rapport.intro} />
      <RapportMarketing
        monthlyBudget={rapport.monthlyBudget}
        totalBudget={rapport.totalBudget}
        matchingFormsCount={rapport.matchingFormsCount}
        preselectionCount={rapport.preselectionCount}
        brokersListingActive={rapport.brokersListingActive}
        brokersListingCount={rapport.brokersListingCount}
        distribution={rapport.distribution}
        otherMarketingActions={rapport.otherMarketingActions}
      />
      <RapportProspection prospectionActions={rapport.prospectionActions} />
      <RapportUpcoming upcomingActions={upcomingActions} />
      <RapportVisites visites={rapport.visites} />
      <RapportRecommendations recommendations={rapport.recommendations} />
      <RapportSimilarEspaces similarEspaces={rapport.similarEspaces} />
      <RapportFooter espaceName={rapport.espaceName} />
    </main>
  );
}
