import { SavedScheme } from "../models/SavedScheme.js";
import { Scheme } from "../models/Scheme.js";
import { AppError } from "../utils/errorHandler.js";

export async function getSavedSchemes(req, res, next) {
  try {
    const saved = await SavedScheme.find({ userId: req.userId });
    const slugs = saved.map((s) => s.schemeSlug);

    const schemes = await Scheme.find({ slug: { $in: slugs } }).select(
      "slug name level overview verified lastVerified applyUrl sourceUrl"
    );

    res.json(schemes);
  } catch (err) {
    next(err);
  }
}

export async function saveScheme(req, res, next) {
  try {
    const { schemeSlug } = req.body;
    if (!schemeSlug) throw new AppError("schemeSlug is required", 400);

    const scheme = await Scheme.findOne({ slug: schemeSlug });
    if (!scheme) throw new AppError("Scheme not found", 404);

    try {
      await SavedScheme.create({ userId: req.userId, schemeSlug });
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
    const { slug } = req.params;
    await SavedScheme.deleteOne({ userId: req.userId, schemeSlug: slug });
    res.json({ message: "Removed" });
  } catch (err) {
    next(err);
  }
}