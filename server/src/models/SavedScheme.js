import mongoose from "mongoose";

const savedSchemeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schemeSlug: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevents the same user from saving the same scheme twice
savedSchemeSchema.index({ userId: 1, schemeSlug: 1 }, { unique: true });

export const SavedScheme = mongoose.model("SavedScheme", savedSchemeSchema);