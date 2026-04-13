"use client";

import { EspaceData } from "@/types/espace";
import Header from "@/components/showcase/Header";
import Presentation from "@/components/showcase/Presentation";
import Location from "@/components/showcase/Location";
import FloorPlan from "@/components/showcase/FloorPlan";
import PhotoGallery from "@/components/showcase/PhotoGallery";
import KeyElements from "@/components/showcase/KeyElements";
import Contacts from "@/components/showcase/Contacts";
import Reassurance from "@/components/showcase/Reassurance";
import LeadGenModal from "@/components/showcase/LeadGenModal";
import Story from "@/components/showcase/Story";
import Highlight from "@/components/showcase/Highlight";
import BuildingStats from "@/components/showcase/BuildingStats";
import Neighborhood from "@/components/showcase/Neighborhood";
import TestimonialBlock from "@/components/showcase/TestimonialBlock";

interface ShowcasePageProps {
  espace: EspaceData;
}

export default function ShowcasePage({ espace }: ShowcasePageProps) {
  const isPrestige = espace.template === "prestige";

  return (
    <main>
      <Header espace={espace} />
      <Presentation espace={espace} />
      {isPrestige && (
        <Story
          title={espace.storyTitle || ""}
          text={espace.storyText || ""}
          photos={espace.storyPhotos || []}
        />
      )}
      {isPrestige && (
        <Highlight
          title={espace.highlightTitle || ""}
          text={espace.highlightText || ""}
          photos={espace.highlightPhotos || []}
        />
      )}
      {isPrestige && (
        <BuildingStats
          surface={espace.buildingSurface || ""}
          floors={espace.buildingFloors || ""}
          year={espace.buildingYear || ""}
          certification={espace.buildingCertification || ""}
        />
      )}
      <Location espace={espace} />
      {isPrestige && (
        <Neighborhood
          title={espace.neighborhoodTitle || ""}
          text={espace.neighborhoodText || ""}
          photos={espace.neighborhoodPhotos || []}
        />
      )}
      {espace.isLeadGen && (
        <LeadGenModal
          espaceName={espace.name}
          espaceSlug={espace.slug}
          leadGenMode={espace.leadGenMode || "unlock"}
          presentationLink={espace.presentationLink || ""}
        />
      )}
      <FloorPlan floorPlanImage={espace.floorPlanImage} />
      <PhotoGallery photos={espace.photos} name={espace.name} />
      {isPrestige && espace.testimonial?.quote && (
        <TestimonialBlock testimonial={espace.testimonial} />
      )}
      <KeyElements espace={espace} />
      <Contacts />
      <Reassurance />
    </main>
  );
}
