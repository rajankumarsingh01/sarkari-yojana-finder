import { Scheme } from "../models/Scheme.js";
import { AppError } from "../utils/errorHandler.js";
import { eligibilitySchema } from "../utils/validators.js";
import { runEligibility } from "../utils/eligibility.js";

export async function getAllSchemes(req, res, next) {
  try {
    const schemes = await Scheme.find().select(
      "slug name level overview verified lastVerified"
    );
    res.json(schemes);
  } catch (err) {
    next(err);
  }
}

export async function getSchemeBySlug(req, res, next) {
  try {
    const scheme = await Scheme.findOne({ slug: req.params.slug });
    if (!scheme) throw new AppError("Scheme not found", 404);
    res.json(scheme);
  } catch (err) {
    next(err);
  }
}

export async function checkEligibility(req, res, next) {
  try {
    const parsed = eligibilitySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }
    const profile = parsed.data;

    const schemes = await Scheme.find();
    const { eligible, maybe } = runEligibility(schemes, profile);

    res.json({ eligible, maybe });
  } catch (err) {
    next(err);
  }
}