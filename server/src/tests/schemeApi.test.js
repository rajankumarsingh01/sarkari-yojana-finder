import { test } from "node:test";
import assert from "node:assert";
import { buildSchemeFilter } from "../controllers/schemeController.js";
import {
  parseOrThrow,
  schemeQuerySchema,
  slugParamSchema,
  registerSchema,
} from "../utils/validators.js";

const parse = (query) => parseOrThrow(schemeQuerySchema, query);

function assertBadRequest(fn, messagePart) {
  assert.throws(fn, (err) => {
    assert.strictEqual(err.statusCode, 400);
    assert.match(err.message, messagePart);
    return true;
  });
}

// --- query validation ---
test("empty query gets page 1 and limit 20", () => {
  const q = parse({});
  assert.strictEqual(q.page, 1);
  assert.strictEqual(q.limit, 20);
});

test("page and limit strings are converted to numbers", () => {
  const q = parse({ page: "2", limit: "10" });
  assert.strictEqual(q.page, 2);
  assert.strictEqual(q.limit, 10);
});

test("invalid category is rejected with 400", () => {
  assertBadRequest(() => parse({ category: "MAGIC" }), /category/i);
});

test("unknown district slug is rejected", () => {
  assertBadRequest(() => parse({ district: "atlantis" }), /district/i);
});

test("limit above 50 is rejected", () => {
  assertBadRequest(() => parse({ limit: "500" }), /limit/i);
});

test("unknown query keys are rejected", () => {
  assertBadRequest(() => parse({ foo: "bar" }), /unrecognized/i);
});

test("object injection like {$ne: ...} is rejected", () => {
  assertBadRequest(() => parse({ state: { $ne: "BIHAR" } }), /state/i);
});

test("slug param must look like a slug", () => {
  assertBadRequest(() => parseOrThrow(slugParamSchema, { slug: "../etc" }), /slug/i);
});

// --- zod 4 regression: auth validation must give a 400, not crash ---
test("short register name gives a 400 with the message", () => {
  assertBadRequest(
    () => parseOrThrow(registerSchema, { name: "a", email: "a@b.com", password: "123456" }),
    /Name must be at least 2/
  );
});

// --- filter building ---
test("no filters means only PUBLISHED schemes", () => {
  assert.deepStrictEqual(buildSchemeFilter(parse({})), {
    $and: [{ publishStatus: "PUBLISHED" }],
  });
});

test("district filter includes nationwide, statewide and that district", () => {
  const filter = buildSchemeFilter(parse({ district: "patna" }));
  assert.deepStrictEqual(filter.$and[1], {
    $or: [
      { coverage: "NATIONWIDE" },
      { coverage: "STATE_WIDE", state: "BIHAR" },
      { coverage: "SELECTED_DISTRICTS", state: "BIHAR", districts: "patna" },
    ],
  });
});

test("state filter includes nationwide central schemes", () => {
  const filter = buildSchemeFilter(parse({ state: "BIHAR" }));
  assert.deepStrictEqual(filter.$and[1], {
    $or: [{ state: "BIHAR" }, { coverage: "NATIONWIDE" }],
  });
});

test("category and status are added as simple conditions", () => {
  const filter = buildSchemeFilter(parse({ category: "FARMER", status: "OPEN" }));
  assert.deepStrictEqual(filter.$and, [
    { publishStatus: "PUBLISHED" },
    { categories: "FARMER" },
    { schemeStatus: "OPEN" },
  ]);
});