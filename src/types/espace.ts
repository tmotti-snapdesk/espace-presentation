export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  photo: string;
}

export interface MetroStation {
  name: string;
  lines: string;
  distance: string;
}

export type LeadGenMode = "unlock" | "redirect" | "voir_suite";
export type Template = "standard" | "prestige";

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface EspaceData {
  slug: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  postalCode: string;
  workstations: number;
  openSpaces: number;
  meetingRooms: number;
  hasLunchArea: boolean;
  hasEquippedKitchen: boolean;
  hasBalconFilant: boolean;
  hasTerrace: boolean;
  hasAirConditioning: boolean;
  hasBikeRack: boolean;
  amenities: string[];
  metroStations: MetroStation[];
  availability: string;
  pricePerMonth: string;
  leaseDuration: string;
  noticePeriod: string;
  videoUrl: string;
  photos: string[];
  floorPlanImage: string;
  contacts: Contact[];
  isLeadGen: boolean;
  leadGenMode: LeadGenMode;
  leadGenDismissible: boolean;
  presentationLink: string;
  // Prestige template fields
  template: Template;
  storyTitle: string;
  storyText: string;
  storyPhotos: string[];
  highlightTitle: string;
  highlightText: string;
  highlightPhotos: string[];
  buildingSurface: string;
  buildingFloors: string;
  buildingYear: string;
  buildingCertification: string;
  neighborhoodTitle: string;
  neighborhoodText: string;
  neighborhoodPhotos: string[];
  testimonial: Testimonial;
  createdAt: string;
}

export interface EspaceFormData {
  name: string;
  tagline: string;
  address: string;
  city: string;
  postalCode: string;
  workstations: string;
  openSpaces: string;
  meetingRooms: string;
  hasLunchArea: boolean;
  hasEquippedKitchen: boolean;
  hasBalconFilant: boolean;
  hasTerrace: boolean;
  hasAirConditioning: boolean;
  hasBikeRack: boolean;
  amenities: string;
  metroStations: MetroStation[];
  availability: string;
  pricePerMonth: string;
  leaseDuration: string;
  noticePeriod: string;
  isLeadGen: boolean;
  leadGenMode: LeadGenMode;
  leadGenDismissible: boolean;
  presentationLink: string;
  // Prestige template fields
  template: Template;
  storyTitle: string;
  storyText: string;
  highlightTitle: string;
  highlightText: string;
  buildingSurface: string;
  buildingFloors: string;
  buildingYear: string;
  buildingCertification: string;
  neighborhoodTitle: string;
  neighborhoodText: string;
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialRole: string;
}
