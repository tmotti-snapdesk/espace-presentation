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

interface ShowcasePageProps {
  espace: EspaceData;
}

export default function ShowcasePage({ espace }: ShowcasePageProps) {
  return (
    <main>
      <Header espace={espace} />
      <Presentation espace={espace} />
      <Location espace={espace} />
      <FloorPlan floorPlanImage={espace.floorPlanImage} />
      <PhotoGallery photos={espace.photos} name={espace.name} />
      <KeyElements espace={espace} />
      <Contacts contacts={espace.contacts} />
      <Reassurance />
    </main>
  );
}
