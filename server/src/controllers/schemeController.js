import { Scheme } from "../models/Scheme.js";
import { AppError } from "../utils/errorHandler.js";
import {
  parseOrThrow,
  schemeQuerySchema,
  slugParamSchema,
} from "../utils/validators.js";

// The district list we ship is Bihar's, so a district filter implies Bihar.
const DISTRICT_STATE = "BIHAR";

// Fields shown on list cards. sources stays so the official link is never lost.
const LIST_FIELDS = [
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
  "startDate",
  "deadline",
  "sources",
  "verification.lastVerifiedAt",
  "updatedAt",
].join(" ");

// Detail page gets everything except internal review fields.
const DETAIL_HIDE =
  "-__v -verification.verifiedBy -verification.aiConfidence -verification.discoveredBy";

// Turns a validated query into a MongoDB filter. Pure function (easy to unit test).
export function buildSchemeFilter(q) {
  // Public API only ever shows published schemes.
  const and = [{ publishStatus: "PUBLISHED" }];

  if (q.state) {
    // Bihar schemes + central schemes that apply to the whole country
    and.push({ $or: [{ state: q.state }, { coverage: "NATIONWIDE" }] });
  }

  if (q.district) {
    and.push({
      $or: [
        { coverage: "NATIONWIDE" },
        { coverage: "STATE_WIDE", state: DISTRICT_STATE },
        { coverage: "SELECTED_DISTRICTS", state: DISTRICT_STATE, districts: q.district },
      ],
    });
  }

  if (q.category) and.push({ categories: q.category });
  if (q.status) and.push({ schemeStatus: q.status });
  if (q.type) and.push({ type: q.type });
  if (q.level) and.push({ level: q.level });

  return { $and: and };
}

export async function listSchemes(req, res, next) {
  try {
    const q = parseOrThrow(schemeQuerySchema, req.query);
    const filter = buildSchemeFilter(q);
    const skip = (q.page - 1) * q.limit;

    const [items, total] = await Promise.all([
      Scheme.find(filter)
        .select(LIST_FIELDS)
        .sort({ updatedAt: -1, _id: -1 })
        .skip(skip)
        .limit(q.limit)
        .lean(),
      Scheme.countDocuments(filter),
    ]);

    res.json({
      items,
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.ceil(total / q.limit),
    });
  } catch (err) {
    next(err);
  }
}

export async function getScheme(req, res, next) {
  try {
    const { slug } = parseOrThrow(slugParamSchema, req.params);

    const scheme = await Scheme.findOne({ slug, publishStatus: "PUBLISHED" })
      .select(DETAIL_HIDE)
      .lean();
    if (!scheme) throw new AppError("Scheme not found", 404);

    res.json(scheme);
  } catch (err) {
    next(err);
  }
}