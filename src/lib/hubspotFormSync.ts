import "server-only";
import { cache } from "react";
import type { LpFormField, LpFormFieldType } from "@/types/lp";
import { findPreset } from "@/lib/hubspotFieldCatalog";

// Server-side fetch of a HubSpot form's schema, converted to our
// `LpFormField` shape so the LP can render it with the local design.
//
// Requires a HubSpot private-app token in HUBSPOT_PRIVATE_APP_TOKEN with the
// `forms` (read) scope. Returns null when the token is missing, the form is
// not found, or the request fails — callers fall back to manual config or
// the legacy 7-field form.

interface HubspotFormFieldOption {
  label: string;
  value: string;
}

interface HubspotFormField {
  name: string;
  label: string;
  fieldType: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  hidden?: boolean;
  options?: HubspotFormFieldOption[];
  validation?: { useDefaultBlockList?: boolean };
}

interface HubspotFormFieldGroup {
  fields: HubspotFormField[];
}

interface HubspotFormResponse {
  id: string;
  name?: string;
  fieldGroups?: HubspotFormFieldGroup[];
}

function mapFieldType(hubspotType: string): LpFormFieldType {
  switch (hubspotType) {
    case "email":            return "email";
    case "phone":            return "tel";
    case "date":
    case "datetime":         return "date";
    case "multi_line_text":
    case "textarea":         return "textarea";
    case "dropdown":
    case "select":
    case "radio":            return "select";
    case "single_checkbox":
    case "booleancheckbox":  return "checkbox";
    case "single_line_text":
    case "text":
    default:                 return "text";
  }
}

function convert(field: HubspotFormField): LpFormField | null {
  if (field.hidden) return null;
  const preset = findPreset(field.name);
  return {
    hubspotName: field.name,
    label: field.placeholder || field.label || field.name,
    type: mapFieldType(field.fieldType),
    required: Boolean(field.required),
    options: field.options && field.options.length > 0
      ? field.options.map((o) => o.label)
      : undefined,
    mapToSearchingForOffice: preset?.supportsSearchingForOffice ? true : undefined,
  };
}

export const fetchHubspotFormFields = cache(
  async (formId: string): Promise<LpFormField[] | null> => {
    const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
    if (!token || !formId) return null;

    try {
      const res = await fetch(
        `https://api.hubapi.com/marketing/v3/forms/${encodeURIComponent(formId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          // Re-fetch periodically — kept in sync with the LP page's
          // `revalidate = 3600` so schema edits in HubSpot show up within
          // the hour without forcing a full rebuild.
          next: { revalidate: 3600, tags: [`hubspot-form-${formId}`] },
        }
      );

      if (!res.ok) {
        console.error(`HubSpot form fetch failed (${formId}):`, res.status, await res.text().catch(() => ""));
        return null;
      }

      const data = (await res.json()) as HubspotFormResponse;
      const fields = (data.fieldGroups || [])
        .flatMap((g) => g.fields || [])
        .map(convert)
        .filter((f): f is LpFormField => f !== null);

      return fields.length > 0 ? fields : null;
    } catch (err) {
      console.error(`HubSpot form fetch error (${formId}):`, err);
      return null;
    }
  }
);
