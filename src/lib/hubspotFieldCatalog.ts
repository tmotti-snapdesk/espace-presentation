import type { LpFormField, LpFormFieldType } from "@/types/lp";

// Catalog of the HubSpot properties we routinely collect on landing-page
// forms. The admin picks an entry from this list; the value column is the
// real HubSpot internal name that the API uses when forwarding the lead.
//
// Add a new entry here once a property has been mapped on HubSpot's side —
// it then becomes available across all LPs without code changes elsewhere.

export interface HubspotFieldPreset {
  hubspotName: string;
  label: string;          // shown in the admin dropdown
  defaultType: LpFormFieldType;
  defaultLabel: string;   // placeholder pre-filled in the admin UI
  defaultOptions?: string[];
  supportsSearchingForOffice?: boolean;
}

export const HEADCOUNT_OPTIONS = [
  "Entre 1 et 5",
  "6 à 10",
  "11 à 20",
  "21 à 50",
  "Plus de 50",
];

export const PROJECT_OPTIONS = [
  "Oui, dans les 3 prochains mois",
  "Oui, dans les 6 prochains mois",
  "Peut-être d'ici 1 an",
  "Pas pour l'instant",
];

export const HUBSPOT_FIELD_PRESETS: HubspotFieldPreset[] = [
  { hubspotName: "email",      label: "Email",                   defaultType: "email",    defaultLabel: "Email professionnel" },
  { hubspotName: "firstname",  label: "Prénom",                  defaultType: "text",     defaultLabel: "Prénom" },
  { hubspotName: "lastname",   label: "Nom",                     defaultType: "text",     defaultLabel: "Nom" },
  { hubspotName: "phone",      label: "Téléphone",               defaultType: "tel",      defaultLabel: "Téléphone" },
  { hubspotName: "company",    label: "Entreprise",              defaultType: "text",     defaultLabel: "Entreprise" },
  { hubspotName: "address",    label: "Adresse",                 defaultType: "text",     defaultLabel: "Adresse des bureaux" },
  { hubspotName: "nombre_de_postes", label: "Nombre de postes", defaultType: "select",   defaultLabel: "Nombre de postes recherchés", defaultOptions: HEADCOUNT_OPTIONS },
  { hubspotName: "quartier",         label: "Quartier",         defaultType: "text",     defaultLabel: "Quartier souhaité" },
  { hubspotName: "date_amenagement", label: "Date d'emménagement", defaultType: "date",  defaultLabel: "Date d'emménagement souhaitée" },
  { hubspotName: "budget_mensuel__pour_attribution_oh", label: "Budget mensuel", defaultType: "text", defaultLabel: "Budget mensuel" },
  { hubspotName: "projet_de_bureau", label: "Projet de bureau", defaultType: "select",   defaultLabel: "Projet de nouveaux bureaux ?", defaultOptions: PROJECT_OPTIONS, supportsSearchingForOffice: true },
  { hubspotName: "message",          label: "Message libre",    defaultType: "textarea", defaultLabel: "Votre message" },
];

export const CUSTOM_PRESET_VALUE = "__custom__";

export function findPreset(hubspotName: string): HubspotFieldPreset | undefined {
  return HUBSPOT_FIELD_PRESETS.find((p) => p.hubspotName === hubspotName);
}

export function makeFieldFromPreset(preset: HubspotFieldPreset): LpFormField {
  return {
    hubspotName: preset.hubspotName,
    label: preset.defaultLabel,
    type: preset.defaultType,
    required: preset.hubspotName === "email",
    options: preset.defaultOptions ? [...preset.defaultOptions] : undefined,
    mapToSearchingForOffice: preset.supportsSearchingForOffice ? true : undefined,
  };
}

// The 7-field legacy form preserved as the default when an LP has no
// `formFields` configured. Kept as data so the renderer has a single path.
export const LEGACY_DEFAULT_FIELDS: LpFormField[] = [
  { hubspotName: "firstname", label: "Prénom *",                          type: "text",   required: true,  halfWidth: true },
  { hubspotName: "lastname",  label: "Nom *",                             type: "text",   required: true,  halfWidth: true },
  { hubspotName: "email",     label: "Email professionnel *",             type: "email",  required: true,  halfWidth: true },
  { hubspotName: "company",   label: "Entreprise",                        type: "text",   required: false, halfWidth: true },
  { hubspotName: "address",   label: "Adresse des bureaux *",             type: "text",   required: true,  halfWidth: true },
  { hubspotName: "nombre_de_postes", label: "Effectif",                   type: "select", required: false, halfWidth: true, options: HEADCOUNT_OPTIONS },
  { hubspotName: "projet_de_bureau", label: "Projet de nouveaux bureaux ? *", type: "select", required: true, options: PROJECT_OPTIONS, mapToSearchingForOffice: true },
];
