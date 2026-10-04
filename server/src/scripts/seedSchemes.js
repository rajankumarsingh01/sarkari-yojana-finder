import "dotenv/config";
import fs from "fs";
import { connectDB } from "../config/db.js";
import { Scheme } from "../models/Scheme.js";
import mongoose from "mongoose";

async function seed() {
  await connectDB();

  const raw = fs.readFileSync("./src/data/schemes.seed.json", "utf-8");
  const schemes = JSON.parse(raw);

  for (const scheme of schemes) {
    await Scheme.findOneAndUpdate({ slug: scheme.slug }, scheme, {
      upsert: true,
      returnDocument: "after",
    });
    console.log(`Upserted: ${scheme.slug}`);
  }

  console.log(`Done. ${schemes.length} schemes processed.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});