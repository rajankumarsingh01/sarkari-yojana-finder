import { test } from "node:test";
import assert from "node:assert";
import { Scheme } from "../models/Scheme.js";
import { BIHAR_DISTRICTS } from "../constants/districts.js";

// Minimal valid draft. This is test structure only, not real scheme data.
const base = () => ({
  slug: "test-scheme",
  title: { en: "Test scheme" },
  level: "STATE",
  state: "BIHAR",
  coverage: "STATE_WIDE",
  type: "SCHEME",
  categories: ["EDUCATION"],
});

async function assertInvalid(data, path) {
  await assert.rejects(new Scheme(data).validate(), (err) => {
    assert.strictEqual(err.name, "ValidationError");
    assert.ok(err.errors[path], `expected error on "${path}", got: ${Object.keys(err.errors)}`);
    return true;
  });
}

test("Bihar has 38 districts with unique slugs", () => {
  assert.strictEqual(BIHAR_DISTRICTS.length, 38);
  assert.strictEqual(new Set(BIHAR_DISTRICTS.map((d) => d.slug)).size, 38);
});

test("a DRAFT without sources is valid", async () => {
  await new Scheme(base()).validate();
});

test("fresh scheme has every eligibility rule UNSPECIFIED", () => {
  const s = new Scheme(base());
  assert.strictEqual(s.eligibility.age.mode, "UNSPECIFIED");
  assert.strictEqual(s.eligibility.gender.mode, "UNSPECIFIED");
  assert.strictEqual(s.eligibility.disability.mode, "UNSPECIFIED");
});

test("PUBLISHED without a source is invalid", async () => {
  await assertInvalid({ ...base(), publishStatus: "PUBLISHED" }, "sources");
});

test("PUBLISHED with a primary source is valid and domain is auto-filled", async () => {
  const doc = new Scheme({
    ...base(),
    publishStatus: "PUBLISHED",
    sources: [{ url: "https://example.gov.in/notice", type: "NOTIFICATION", isPrimary: true }],
  });
  await doc.validate();
  assert.strictEqual(doc.sources[0].domain, "example.gov.in");
});

test("source with a bad URL is invalid", async () => {
  await assertInvalid(
    { ...base(), sources: [{ url: "not a url", type: "PORTAL" }] },
    "sources.0.url"
  );
});

test("SELECTED_DISTRICTS needs districts", async () => {
  await assertInvalid({ ...base(), coverage: "SELECTED_DISTRICTS" }, "districts");
});

test("unknown district slug is invalid", async () => {
  await assertInvalid(
    { ...base(), coverage: "SELECTED_DISTRICTS", districts: ["atlantis"] },
    "districts"
  );
});

test("known district slug is valid", async () => {
  await new Scheme({
    ...base(),
    coverage: "SELECTED_DISTRICTS",
    districts: ["patna"],
  }).validate();
});

test("categories cannot be empty", async () => {
  await assertInvalid({ ...base(), categories: [] }, "categories");
});

test("STATE level scheme cannot be NATIONWIDE", async () => {
  await assertInvalid({ ...base(), coverage: "NATIONWIDE" }, "coverage");
});

test("eligibility mode ONLY needs values", async () => {
  await assertInvalid(
    { ...base(), eligibility: { gender: { mode: "ONLY", values: [] } } },
    "eligibility.gender.values"
  );
});

test("eligibility age RANGE needs min or max", async () => {
  await assertInvalid(
    { ...base(), eligibility: { age: { mode: "RANGE" } } },
    "eligibility.age.mode"
  );
});