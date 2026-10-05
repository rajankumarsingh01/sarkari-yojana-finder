import { test } from "node:test";
import assert from "node:assert";
import { buildSearchTerms, toTextSearch } from "../utils/searchQuery.js";
import { buildSchemeFilter } from "../controllers/schemeController.js";
import { parseOrThrow, schemeQuerySchema } from "../utils/validators.js";
import { Scheme } from "../models/Scheme.js";

const parse = (query) => parseOrThrow(schemeQuerySchema, query);

// --- term building ---
test("Hinglish word expands to the words official texts use", () => {
  const terms = buildSearchTerms("kisan");
  assert.ok(terms.includes("kisan"));
  assert.ok(terms.includes("farmer"));
  assert.ok(terms.includes("किसान"));
});

test("English plural also searches the singular", () => {
  const terms = buildSearchTerms("Farmers");
  assert.ok(terms.includes("farmers"));
  assert.ok(terms.includes("farmer"));
});

test("filler words and 'bihar' are dropped", () => {
  const terms = buildSearchTerms("bihar mein students ke liye scholarship");
  assert.ok(terms.includes("student"));
  assert.ok(terms.includes("scholarship"));
  for (const filler of ["bihar", "mein", "ke", "liye"]) {
    assert.ok(!terms.includes(filler), `${filler} should be dropped`);
  }
});

test("only filler words gives no search", () => {
  assert.deepStrictEqual(buildSearchTerms("ke liye"), []);
  assert.strictEqual(toTextSearch("ke liye"), null);
});

test("both spellings of a Hindi word with nukta find the same expansion", () => {
  assert.ok(buildSearchTerms("बाढ़").includes("आपदा"));
  assert.ok(buildSearchTerms("बाढ").includes("आपदा"));
});

test("flood question expands flood and money words", () => {
  const terms = buildSearchTerms("flood me paisa kab milega");
  assert.ok(terms.includes("disaster"));
  assert.ok(terms.includes("financial"));
  assert.ok(!terms.includes("kab"));
});

test("search operators and special characters never reach MongoDB", () => {
  const terms = buildSearchTerms('"farmer" -loan $where {a: 1}');
  assert.ok(terms.length > 0);
  for (const term of terms) {
    assert.match(term, /^[\p{L}\p{M}\p{N}]+$/u, `unsafe term: ${term}`);
  }
});

test("a very long query is capped at 30 terms", () => {
  const long = Array.from({ length: 100 }, (_, i) => `word${i}`).join(" ");
  assert.ok(buildSearchTerms(long).length <= 30);
});

// --- validation ---
test("q must be at least 2 characters", () => {
  assert.throws(() => parse({ q: "a" }), /at least 2/);
});

test("q longer than 100 characters is rejected", () => {
  assert.throws(() => parse({ q: "x".repeat(101) }), /100/);
});

test("q is trimmed", () => {
  assert.strictEqual(parse({ q: "  kisan  " }).q, "kisan");
});

// --- filter ---
test("search adds a $text clause after the other filters", () => {
  const filter = buildSchemeFilter(parse({ q: "kisan", category: "FARMER" }));
  assert.deepStrictEqual(filter.$and[1], { categories: "FARMER" });
  assert.ok(filter.$and[2].$text.$search.includes("farmer"));
});

test("search with only filler words matches nothing", () => {
  const filter = buildSchemeFilter(parse({ q: "ke liye" }));
  assert.deepStrictEqual(filter.$and[1], { _id: { $exists: false } });
});

test("no q means no $text clause", () => {
  const filter = buildSchemeFilter(parse({ category: "FARMER" }));
  assert.ok(!filter.$and.some((c) => c.$text));
});

// --- index ---
test("Scheme has one text index with the expected settings", () => {
  const textIndexes = Scheme.schema.indexes().filter(([fields]) =>
    Object.values(fields).includes("text")
  );
  assert.strictEqual(textIndexes.length, 1);
  const [fields, options] = textIndexes[0];
  assert.strictEqual(options.name, "scheme_text");
  assert.strictEqual(options.default_language, "none");
  assert.ok("title.en" in fields && "title.hi" in fields);
});