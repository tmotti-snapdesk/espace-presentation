import "server-only";
import { cache } from "react";
import type { LpFormField, LpFormFieldType } from "@/types/lp";
import { findPreset } from "@/lib/hubspotFieldCatalog";

// Server-side fetch of a HubSpot form's schema, converted to our
// `LpFormField` shape so the LP can render it with the local design.
//
// Tries Marketing v3 first (the modern "marketing forms"), then falls
// back to the legacy v2 endpoint when v3 returns nothing useful — older
// forms still served via the public submissions endpoint typically only
// surface their schema through v2.
//
// Requires a HubSpot private-app token in HUBSPOT_PRIVATE_APP_TOKEN with
// the `forms` (read) scope. Returns null when the token is missing, both
// endpoints fail, or the response is empty — callers fall back to the
// LP's manual config or the legacy 7-field form.

interface HubspotOption {
  label: string;
  value: string;
}

interface HubspotFieldV3 {
  name: string;
  label: string;
  fieldType: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  hidden?: boolean;
  options?: HubspotOption[];
}

interface HubspotFormResponseV3 {
  id: string;
  name?: string;
  fieldGroups?: { fields: HubspotFieldV3[] }[];
}

interface HubspotFieldV2 {
  name: string;
  label: string;
  fieldType: string;
  type?: string;
  required?: boolean;
  hidden?: boolean;
  placeholder?: string;
  options?: HubspotOption[];
}

interface HubspotFormResponseV2 {
  guid: string;
  formFieldGroups?: { fields: HubspotFieldV2[] }[];
}

function mapFieldType(hubspotType: string): LpFormFieldType {
  switch (hubspotType) {
    case "email":             return "email";
    case "phone":
    case "phonenumber":       return "tel";
    case "date":
    case "datetime":          return "date";
    case "multi_line_text":
    case "textarea":          return "textarea";
    case "dropdown":
    case "select":
    case "radio":             return "select";
    case "single_checkbox":
    case "booleancheckbox":   return "checkbox";
    case "single_line_text":
    case "text":
    default:                  return "text";
  }
}

function convert(field: HubspotFieldV3 | HubspotFieldV2): LpFormField | null {
  if (field.hidden) return null;
  const preset = findPreset(field.name);
  // v2 surfaces the type under `fieldType` (sometimes "text") while v3 uses
  // proper enum values; both branches go through the same mapper.
  const type = mapFieldType(field.fieldType);
  return {
    hubspotName: field.name,
    label: field.placeholder || field.label || field.name,
    type,
    required: Boolean(field.required),
    options: field.options && field.options.length > 0
      ? field.options.map((o) => o.label)
      : undefined,
    mapToSearchingForOffice: preset?.supportsSearchingForOffice ? true : undefined,
  };
}

async function fetchV3(formId: string, token: string): Promise<LpFormField[] | null> {
  try {
    const res = await fetch(
      `https://api.hubapi.com/marketing/v3/forms/${encodeURIComponent(formId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600, tags: [`hubspot-form-${formId}`] },
      }
    );
    if (!res.ok) {
      console.error(`HubSpot v3 form fetch failed (${formId}):`, res.status);
      return null;
    }
    const data = (await res.json()) as HubspotFormResponseV3;
    const fields = (data.fieldGroups || [])
      .flatMap((g) => g.fields || [])
      .map(convert)
      .filter((f): f is LpFormField => f !== null);
    return fields.length > 0 ? fields : null;
  } catch (err) {
    console.error(`HubSpot v3 form fetch error (${formId}):`, err);
    return null;
  }
}

async function fetchV2(formId: string, token: string): Promise<LpFormField[] | null> {
  try {
    const res = await fetch(
      `https://api.hubapi.com/forms/v2/forms/${encodeURIComponent(formId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600, tags: [`hubspot-form-${formId}`] },
      }
    );
    if (!res.ok) {
      console.error(`HubSpot v2 form fetch failed (${formId}):`, res.status);
      return null;
    }
    const data = (await res.json()) as HubspotFormResponseV2;
    const fields = (data.formFieldGroups || [])
      .flatMap((g) => g.fields || [])
      .map(convert)
      .filter((f): f is LpFormField => f !== null);
    return fields.length > 0 ? fields : null;
  } catch (err) {
    console.error(`HubSpot v2 form fetch error (${formId}):`, err);
    return null;
  }
}

export const fetchHubspotFormFields = cache(
  async (formId: string): Promise<LpFormField[] | null> => {
    const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
    if (!token || !formId) return null;
    return (await fetchV3(formId, token)) ?? (await fetchV2(formId, token));
  }
);
