import mongoose from "mongoose";
import { SOURCE_TYPES, STATES, SOURCE_SCAN_STATUSES } from "../constants/enums.js";

const { Schema } = mongoose;

// A monitored official website/page. Only whitelisted domains are ever fetched (Phase 6).
// Kept small on purpose; Phase 6 adds hash/health fields.
const sourceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    baseUrl: { type: String, required: true, trim: true },
    domain: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    type: { type: String, enum: SOURCE_TYPES, required: true },
    state: { type: String, enum: [...STATES, null], default: null },
    department: { type: String, trim: true, default: null },
    isActive: { type: Boolean, default: true },
    lastScannedAt: { type: Date, default: null },
    lastStatus: { type: String, enum: SOURCE_SCAN_STATUSES, default: "NEVER" },
    notes: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

sourceSchema.pre("validate", function () {
  try {
    const u = new URL(this.baseUrl);
    if (!["http:", "https:"].includes(u.protocol)) throw new Error("bad protocol");
    this.domain = u.hostname.toLowerCase();
  } catch {
    this.invalidate("baseUrl", "baseUrl must be a valid http(s) URL");
  }
});

export const Source = mongoose.model("Source", sourceSchema);