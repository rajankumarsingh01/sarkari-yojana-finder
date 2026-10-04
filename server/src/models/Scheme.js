import mongoose from "mongoose";
import {
  LEVELS,
  STATES,
  COVERAGES,
  CATEGORIES,
  SCHEME_TYPES,
  SCHEME_STATUSES,
  PUBLISH_STATUSES,
  SOURCE_TYPES,
  DISCOVERED_BY,
  BENEFIT_FREQUENCIES,
  GENDERS,
  RESIDENCES,
  LIST_RULE_MODES,
  RANGE_RULE_MODES,
  FLAG_RULE_MODES,
} from "../constants/enums.js";
import { DISTRICT_SLUGS } from "../constants/districts.js";

const { Schema } = mongoose;

// Reusable pieces ---------------------------------------------------------

// Optional text. null means "the official source did not say".
const text = { type: String, trim: true, default: null };

// Eligibility rule shapes. mode tells us what the source actually said:
//   UNSPECIFIED = source did not mention this rule (engine must say CHECK)
//   ANY         = source clearly says anyone qualifies on this point
//   ONLY / RANGE / REQUIRED = source gives a real condition
function listRule(valueType) {
  return new Schema(
    {
      mode: { type: String, enum: LIST_RULE_MODES, default: "UNSPECIFIED" },
      values: { type: [valueType], default: [] },
    },
    { _id: false }
  );
}

const rangeRule = new Schema(
  {
    mode: { type: String, enum: RANGE_RULE_MODES, default: "UNSPECIFIED" },
    min: { type: Number, default: null, min: 0 },
    max: { type: Number, default: null, min: 0 },
  },
  { _id: false }
);

const flagRule = new Schema(
  {
    mode: { type: String, enum: FLAG_RULE_MODES, default: "UNSPECIFIED" },
  },
  { _id: false }
);

const freeText = { type: String, trim: true, uppercase: true };

const sourceSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    title: text,
    type: { type: String, enum: SOURCE_TYPES, required: true },
    publishedAt: { type: Date, default: null },
    domain: { type: String, lowercase: true, trim: true, default: null }, // auto-filled from url
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

// Scheme ------------------------------------------------------------------

const schemeSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and hyphens"],
    },
    title: {
      en: { type: String, trim: true, required: [true, "English title is required"] },
      hi: text,
    },
    summary: { en: text, hi: text }, // simple-language explanation
    officialDescription: text, // text taken from the official source

    level: { type: String, enum: LEVELS, required: true },
    state: { type: String, enum: [...STATES, null], default: null }, // null for nationwide central schemes
    coverage: { type: String, enum: COVERAGES, required: true },
    districts: { type: [String], default: [] },

    categories: { type: [{ type: String, enum: CATEGORIES }], default: [] },
    tags: { type: [String], default: [] },
    department: text,
    type: { type: String, enum: SCHEME_TYPES, required: true },

    benefit: {
      amount: { type: Number, default: null, min: 0 },
      amountText: text,
      frequency: { type: String, enum: BENEFIT_FREQUENCIES, default: "UNKNOWN" },
      description: text,
      paymentMethod: text,
    },

    eligibility: {
      age: { type: rangeRule, default: () => ({}) },
      gender: { type: listRule({ type: String, enum: GENDERS }), default: () => ({}) },
      occupations: { type: listRule(freeText), default: () => ({}) },
      income: { type: rangeRule, default: () => ({}) }, // max = max annual income in INR
      residence: { type: listRule({ type: String, enum: RESIDENCES }), default: () => ({}) },
      socialCategories: { type: listRule(freeText), default: () => ({}) },
      disability: { type: flagRule, default: () => ({}) },
      educationLevels: { type: listRule(freeText), default: () => ({}) },
      otherConditions: { type: [String], default: [] },
    },

    // Empty array here means "source did not list these", not "none needed".
    documents: { type: [String], default: [] },
    applicationProcess: { type: [String], default: [] },
    applicationUrl: text,
    offlineApplicationInfo: text,

    startDate: { type: Date, default: null },
    deadline: { type: Date, default: null },
    schemeStatus: { type: String, enum: SCHEME_STATUSES, default: "UNKNOWN" },
    notificationNumber: text,

    sources: { type: [sourceSchema], default: [] },

    publishStatus: { type: String, enum: PUBLISH_STATUSES, default: "DRAFT" },
    verification: {
      lastVerifiedAt: { type: Date, default: null },
      verifiedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      aiConfidence: { type: Number, min: 0, max: 1, default: null },
      discoveredBy: { type: String, enum: DISCOVERED_BY, default: "MANUAL" },
    },
  },
  { timestamps: true }
);

schemeSchema.index({ publishStatus: 1, state: 1, categories: 1 });
schemeSchema.index({ districts: 1 });
schemeSchema.index({ schemeStatus: 1 });

// Cross-field checks that a plain schema cannot express.
schemeSchema.pre("validate", function () {
  // 1. Categories
  if (this.categories.length === 0) {
    this.invalidate("categories", "At least one category is required");
  }

  // 2. Level / state / coverage / districts
  if (this.coverage !== "NATIONWIDE" && !this.state) {
    this.invalidate("state", "State is required unless coverage is NATIONWIDE");
  }
  if (this.level === "STATE" && this.coverage === "NATIONWIDE") {
    this.invalidate("coverage", "A STATE level scheme cannot be NATIONWIDE");
  }
  if (this.coverage === "SELECTED_DISTRICTS") {
    if (this.districts.length === 0) {
      this.invalidate("districts", "Districts are required when coverage is SELECTED_DISTRICTS");
    }
  } else if (this.districts.length > 0) {
    this.invalidate("districts", "Districts must be empty unless coverage is SELECTED_DISTRICTS");
  }
  for (const d of this.districts) {
    if (!DISTRICT_SLUGS.includes(d)) {
      this.invalidate("districts", `Unknown district slug: ${d}`);
    }
  }

  // 3. Sources: validate URL and auto-fill domain
  this.sources.forEach((src, i) => {
    try {
      const u = new URL(src.url);
      if (!["http:", "https:"].includes(u.protocol)) throw new Error("bad protocol");
      src.domain = u.hostname.toLowerCase();
    } catch {
      this.invalidate(`sources.${i}.url`, "Source URL must be a valid http(s) URL");
    }
  });

  // 4. A published scheme must show an official source
  if (this.publishStatus === "PUBLISHED") {
    if (this.sources.length === 0) {
      this.invalidate("sources", "A published scheme needs at least one official source");
    } else if (!this.sources.some((s) => s.isPrimary)) {
      this.invalidate("sources", "A published scheme needs one primary source");
    }
  }

  // 5. Eligibility rule consistency
  const e = this.eligibility;
  for (const key of ["gender", "occupations", "residence", "socialCategories", "educationLevels"]) {
    const rule = e?.[key];
    if (!rule) continue;
    if (rule.mode === "ONLY" && rule.values.length === 0) {
      this.invalidate(`eligibility.${key}.values`, "mode ONLY needs at least one value");
    }
    if (rule.mode !== "ONLY" && rule.values.length > 0) {
      this.invalidate(`eligibility.${key}.values`, "values are allowed only when mode is ONLY");
    }
  }
  for (const key of ["age", "income"]) {
    const rule = e?.[key];
    if (!rule) continue;
    const hasLimit = rule.min !== null || rule.max !== null;
    if (rule.mode === "RANGE" && !hasLimit) {
      this.invalidate(`eligibility.${key}.mode`, "mode RANGE needs min or max");
    }
    if (rule.mode !== "RANGE" && hasLimit) {
      this.invalidate(`eligibility.${key}.mode`, "min/max are allowed only when mode is RANGE");
    }
    if (rule.min !== null && rule.max !== null && rule.min > rule.max) {
      this.invalidate(`eligibility.${key}.min`, "min cannot be greater than max");
    }
  }
});

export const Scheme = mongoose.model("Scheme", schemeSchema);