// DEV ONLY helper to check the API with throw-away records.
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

// Structure only. These are NOT real schemes and carry no real benefit data.
const common = {
  level: "STATE",
  state: "BIHAR",
  type: "SCHEME",
  summary: { en: "Test record to check the API. Not a real scheme.", hi: null },
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
    ...common,
    slug: `${PREFIX}patna`,
    title: { en: "TEST ONLY - Patna farmers record", hi: null },
    coverage: "SELECTED_DISTRICTS",
    districts: ["patna"],
    categories: ["FARMER"],
    schemeStatus: "OPEN",
    publishStatus: "PUBLISHED",
  },
  {
    ...common,
    slug: `${PREFIX}statewide`,
    title: { en: "TEST ONLY - Statewide education record", hi: null },
    coverage: "STATE_WIDE",
    categories: ["EDUCATION"],
    schemeStatus: "CLOSED",
    publishStatus: "PUBLISHED",
  },
  {
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