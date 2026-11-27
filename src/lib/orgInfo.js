// Opportunity Hack's legal identity — the ONE copy on the frontend.
// Twin: backend-ohack.dev api/letters/letter_pdf.py (ORG_* constants on the
// signed participation letters). Change both together.

export const ORG_LEGAL_NAME = "Opportunity Hack, Inc.";
export const ORG_TAX_STATUS = "501(c)(3) nonprofit";
export const ORG_EIN = "84-5113049";
export const ORG_CITY_STATE_ZIP = "Phoenix, Arizona 85016";

export const ORG_INFO = Object.freeze({
  legalName: ORG_LEGAL_NAME,
  taxStatus: ORG_TAX_STATUS,
  ein: ORG_EIN,
  cityStateZip: ORG_CITY_STATE_ZIP,
});
