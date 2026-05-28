"use client";

import { RapportData } from "@/types/rapport";
import RapportHero from "@/components/rapport/RapportHero";
import RapportIntro from "@/components/rapport/RapportIntro";
import RapportMarketing from "@/components/rapport/RapportMarketing";
import RapportProspection from "@/components/rapport/RapportProspection";
import RapportVisites from "@/components/rapport/RapportVisites";
import RapportRecommendations from "@/components/rapport/RapportRecommendations";
import RapportSimilarEspaces from "@/components/rapport/RapportSimilarEspaces";
import RapportFooter from "@/components/rapport/RapportFooter";

interface RapportShowcaseProps {
  rapport: RapportData;
}

export default function RapportShowcase({ rapport }: RapportShowcaseProps) {
  return (
    <main>
      <RapportHero
        espaceName={rapport.espaceName}
        espaceAddress={rapport.espaceAddress}
        month={rapport.month}
        marketingStartDate={rapport.marketingStartDate}
        ownerName={rapport.ownerName}
      />
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
      <RapportVisites visites={rapport.visites} />
      <RapportRecommendations recommendations={rapport.recommendations} />
      <RapportSimilarEspaces similarEspaces={rapport.similarEspaces} />
      <RapportFooter espaceName={rapport.espaceName} />
    </main>
  );
}
