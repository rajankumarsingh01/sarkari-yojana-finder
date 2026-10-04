import { SavedScheme } from "../models/SavedScheme.js";
import { Scheme } from "../models/Scheme.js";
import { AppError } from "../utils/errorHandler.js";
import { parseOrThrow, slugParamSchema } from "../utils/validators.js";

// Same card fields as the public list, so Saved page can reuse the same card.
const SAVED_FIELDS = [
  "slug",
  "title",
  "summary",
  "level",
  "state",
  "coverage",
  "districts",
  "categories",
  "type",
  "department",
  "benefit.amount",
  "benefit.amountText",
  "benefit.frequency",
  "schemeStatus",
  "deadline",
  "sources",
  "verification.lastVerifiedAt",
  "updatedAt",
].join(" ");

export async function getSavedSchemes(req, res, next) {
  try {
    const saved = await SavedScheme.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    const slugs = saved.map((s) => s.schemeSlug);

    // Only published schemes are shown. If a saved scheme is later unpublished, it hides here.
    const schemes = await Scheme.find({ slug: { $in: slugs }, publishStatus: "PUBLISHED" })
      .select(SAVED_FIELDS)
      .lean();

    // Keep "recently saved first" order
    const bySlug = new Map(schemes.map((s) => [s.slug, s]));
    res.json(slugs.map((slug) => bySlug.get(slug)).filter(Boolean));
  } catch (err) {
    next(err);
  }
}

export async function saveScheme(req, res, next) {
  try {
    const { slug } = parseOrThrow(slugParamSchema, { slug: req.body?.schemeSlug });

    const scheme = await Scheme.findOne({ slug, publishStatus: "PUBLISHED" }).select("_id").lean();
    if (!scheme) throw new AppError("Scheme not found", 404);

    try {
      await SavedScheme.create({ userId: req.userId, schemeSlug: slug });
    } catch (err) {
      if (err.code === 11000) {
        throw new AppError("Scheme already saved", 409);
      }
      throw err;
    }

    res.status(201).json({ message: "Saved" });
  } catch (err) {
    next(err);
  }
}

export async function unsaveScheme(req, res, next) {
  try {
    const { slug } = parseOrThrow(slugParamSchema, req.params);
    await SavedScheme.deleteOne({ userId: req.userId, schemeSlug: slug });
    res.json({ message: "Removed" });
  } catch (err) {
    next(err);
  }
}