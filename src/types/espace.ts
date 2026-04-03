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
}
