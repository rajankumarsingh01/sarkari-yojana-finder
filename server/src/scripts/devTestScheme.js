// DEV ONLY helper to check the API and UI with throw-away records.
//   node src/scripts/devTestScheme.js add
//   node src/scripts/devTestScheme.js remove
// Every record uses the slug prefix "test-only-" so cleanup can never touch real data.
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Scheme } from "../models/Scheme.js";
import { SavedScheme } from "../models/SavedScheme.js";

const PREFIX = "test-only-";
const prefixRegex = new RegExp(`^${PREFIX}`);

// Structure only. These are NOT real schemes: every text and number below is
// a made-up test value so we can see how each part of the UI renders.
const common = {
  level: "STATE",
  state: "BIHAR",
  type: "SCHEME",
  sources: [
    {
      url: "https://example.com/test-only",
      title: "Test source (not official)",
      type: "PORTAL",
      isPrimary: true,
    },
  ],
};

const testSchemes = [
  {
    // Rich record: most fields filled, never verified
    ...common,
    slug: `${PREFIX}patna`,
    title: { en: "TEST ONLY - Patna farmers record", hi: null },
    summary: { en: "Test record to check the API. Not a real scheme.", hi: null },
    officialDescription: "TEST ONLY description text. Not from any official source.",
    coverage: "SELECTED_DISTRICTS",
    districts: ["patna"],
    categories: ["FARMER"],
    department: "TEST department",
    schemeStatus: "OPEN",
    publishStatus: "PUBLISHED",
    benefit: {
      amount: null,
      amountText: "TEST amount text",
      frequency: "MONTHLY",
      description: "TEST benefit description.",
      paymentMethod: "TEST payment method",
    },
    eligibility: {
      age: { mode: "RANGE", min: 18, max: 40 },
      gender: { mode: "ONLY", values: ["FEMALE"] },
      occupations: { mode: "ANY" },
      income: { mode: "RANGE", max: 100000 },
      disability: { mode: "NOT_REQUIRED" },
      otherConditions: ["TEST condition one", "TEST condition two"],
    },
    documents: ["TEST document A", "TEST document B"],
    applicationProcess: ["TEST step one", "TEST step two"],
    applicationUrl: "https://example.com/apply-test",
    offlineApplicationInfo: "TEST offline info.",
    startDate: new Date("2030-01-01"),
    deadline: new Date("2030-12-31"),
    notificationNumber: "TEST-000",
  },
  {
    // Sparse record: almost nothing filled, but verified and has a Hindi title
    ...common,
    slug: `${PREFIX}statewide`,
    title: { en: "TEST ONLY - Statewide education record", hi: "टेस्ट - राज्यव्यापी रिकॉर्ड (असली योजना नहीं)" },
    summary: { en: "Test record with almost no details.", hi: null },
    coverage: "STATE_WIDE",
    categories: ["EDUCATION"],
    schemeStatus: "CLOSED",
    publishStatus: "PUBLISHED",
    verification: { lastVerifiedAt: new Date() },
  },
  {
    // Draft: must never appear on the public site
    ...common,
    slug: `${PREFIX}draft`,
    title: { en: "TEST ONLY - Hidden draft record", hi: null },
    coverage: "STATE_WIDE",
    categories: ["FARMER"],
    publishStatus: "DRAFT",
  },
];

async function removeAll() {
  const schemes = await Scheme.deleteMany({ slug: prefixRegex });
  const saved = await SavedScheme.deleteMany({ schemeSlug: prefixRegex });
  console.log(`Removed ${schemes.deletedCount} test schemes, ${saved.deletedCount} saved links.`);
}

async function main() {
  const action = process.argv[2];
  if (!["add", "remove"].includes(action)) {
    console.log("Usage: node src/scripts/devTestScheme.js add|remove");
    process.exit(1);
  }

  await connectDB();

  if (action === "remove") {
    await removeAll();
  } else {
    await removeAll(); // makes "add" safe to run twice
    await Scheme.create(testSchemes);
    console.log(`Added ${testSchemes.length} test schemes (2 published, 1 draft).`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});