// Single source of truth for allowed values.
// Models use these now; zod validators (Phase 1b) will reuse them.

export const LEVELS = ["CENTRAL", "STATE"];
export const STATES = ["BIHAR"]; // more states can be added later
export const COVERAGES = ["NATIONWIDE", "STATE_WIDE", "SELECTED_DISTRICTS"];

export const CATEGORIES = [
  "EDUCATION",
  "AGRICULTURE",
  "FARMER",
  "WOMEN",
  "CHILDREN",
  "SENIOR_CITIZENS",
  "EMPLOYMENT",
  "BUSINESS",
  "HOUSING",
  "HEALTH",
  "FINANCIAL_ASSISTANCE",
  "DISASTER_RELIEF",
  "DISABILITY",
  "WELFARE",
  "SCHOLARSHIP",
  "SKILL_DEVELOPMENT",
  "SUBSIDIES",
  "LABOUR",
  "RURAL_DEVELOPMENT",
];

export const SCHEME_TYPES = [
  "SCHEME",
  "FINANCIAL_ASSISTANCE",
  "DISASTER_RELIEF",
  "SUBSIDY",
  "SCHOLARSHIP",
  "PENSION",
  "EMPLOYMENT",
];

export const SCHEME_STATUSES = ["UPCOMING", "OPEN", "CLOSED", "ONGOING", "UNKNOWN"];
export const PUBLISH_STATUSES = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED"];
export const SOURCE_TYPES = ["PORTAL", "PDF", "PRESS_RELEASE", "NOTIFICATION"];
export const DISCOVERED_BY = ["MANUAL", "AI_AGENT"];
export const BENEFIT_FREQUENCIES = [
  "ONE_TIME",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
  "AS_APPLICABLE",
  "UNKNOWN",
];

export const GENDERS = ["MALE", "FEMALE", "OTHER"];
export const RESIDENCES = ["RURAL", "URBAN"];

// Eligibility rule modes (see Scheme.js for the meaning of each)
export const LIST_RULE_MODES = ["UNSPECIFIED", "ANY", "ONLY"];
export const RANGE_RULE_MODES = ["UNSPECIFIED", "ANY", "RANGE"];
export const FLAG_RULE_MODES = ["UNSPECIFIED", "NOT_REQUIRED", "REQUIRED"];

export const SOURCE_SCAN_STATUSES = ["NEVER", "OK", "FAILED"];