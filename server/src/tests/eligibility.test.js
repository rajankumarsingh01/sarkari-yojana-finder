import { test } from "node:test";
import assert from "node:assert";
import { checkSchemeEligibility } from "../utils/eligibility.js";

const farmerScheme = {
  minAge: null,
  maxAge: null,
  states: ["all"],
  occupations: ["farmer"],
  gender: "any",
  maxAnnualIncome: null,
  socialCategories: ["all"],
};

const ageRestrictedScheme = {
  minAge: 18,
  maxAge: 40,
  states: ["all"],
  occupations: [],
  gender: "any",
  maxAnnualIncome: null,
  socialCategories: ["all"],
};

test("farmer with matching occupation is eligible", () => {
  const result = checkSchemeEligibility(farmerScheme, { occupation: "farmer" });
  assert.strictEqual(result, "eligible");
});

test("non-farmer occupation is not eligible", () => {
  const result = checkSchemeEligibility(farmerScheme, { occupation: "teacher" });
  assert.strictEqual(result, "not_eligible");
});

test("missing occupation field gives maybe, not exclusion", () => {
  const result = checkSchemeEligibility(farmerScheme, { age: 30 });
  assert.strictEqual(result, "maybe");
});

test("age below minAge is not eligible", () => {
  const result = checkSchemeEligibility(ageRestrictedScheme, { age: 15 });
  assert.strictEqual(result, "not_eligible");
});

test("age within range is eligible", () => {
  const result = checkSchemeEligibility(ageRestrictedScheme, { age: 25 });
  assert.strictEqual(result, "eligible");
});

test("missing age when scheme has age rule gives maybe", () => {
  const result = checkSchemeEligibility(ageRestrictedScheme, {});
  assert.strictEqual(result, "maybe");
});