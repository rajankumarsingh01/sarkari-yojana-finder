import mongoose from "mongoose";

const schemeSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    level: { type: String, enum: ["central", "state"], required: true },
    states: { type: [String], default: ["all"] }, // ["all"] = country-wide
    occupations: { type: [String], default: [] }, // [] = any occupation
    gender: { type: String, enum: ["any", "female", "male"], default: "any" },
    minAge: { type: Number, default: null },
    maxAge: { type: Number, default: null },
    maxAnnualIncome: { type: Number, default: null }, // in INR, null = no limit
    socialCategories: { type: [String], default: ["all"] }, // e.g. ["all"], ["SC","ST","OBC"]

    overview: { type: String, required: true },
    eligibilityText: { type: String, required: true },
    benefits: { type: String, required: true },
    documents: { type: [String], default: [] },
    howToApply: { type: String, required: true },

    applyUrl: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    lastVerified: { type: Date, default: null },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Scheme = mongoose.model("Scheme", schemeSchema);