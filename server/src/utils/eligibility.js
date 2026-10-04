// Checks if a single scheme matches a user's profile.
// Returns "eligible", "maybe", or "not_eligible".
export function checkSchemeEligibility(scheme, profile) {
  const checks = [];

  // --- Age ---
  if (profile.age !== undefined && profile.age !== null) {
    if (scheme.minAge !== null && profile.age < scheme.minAge) {
      return "not_eligible";
    }
    if (scheme.maxAge !== null && profile.age > scheme.maxAge) {
      return "not_eligible";
    }
    checks.push(true);
  } else if (scheme.minAge !== null || scheme.maxAge !== null) {
    checks.push("maybe"); // scheme has an age rule, user didn't give age
  }

  // --- State ---
  if (profile.state) {
    const stateOk =
      scheme.states.includes("all") ||
      scheme.states.some((s) => s.toLowerCase() === profile.state.toLowerCase());
    if (!stateOk) return "not_eligible";
    checks.push(true);
  } else if (!scheme.states.includes("all")) {
    checks.push("maybe");
  }

  // --- Occupation ---
  if (profile.occupation) {
    const occOk =
      scheme.occupations.length === 0 ||
      scheme.occupations.some(
        (o) => o.toLowerCase() === profile.occupation.toLowerCase()
      );
    if (!occOk) return "not_eligible";
    checks.push(true);
  } else if (scheme.occupations.length > 0) {
    checks.push("maybe");
  }

  // --- Gender ---
  if (profile.gender) {
    const genderOk = scheme.gender === "any" || scheme.gender === profile.gender;
    if (!genderOk) return "not_eligible";
    checks.push(true);
  } else if (scheme.gender !== "any") {
    checks.push("maybe");
  }

  // --- Income ---
  if (profile.annualIncome !== undefined && profile.annualIncome !== null) {
    if (
      scheme.maxAnnualIncome !== null &&
      profile.annualIncome > scheme.maxAnnualIncome
    ) {
      return "not_eligible";
    }
    checks.push(true);
  } else if (scheme.maxAnnualIncome !== null) {
    checks.push("maybe");
  }

  // --- Social category ---
  if (profile.socialCategory) {
    const catOk =
      scheme.socialCategories.includes("all") ||
      scheme.socialCategories.some(
        (c) => c.toLowerCase() === profile.socialCategory.toLowerCase()
      );
    if (!catOk) return "not_eligible";
    checks.push(true);
  } else if (!scheme.socialCategories.includes("all")) {
    checks.push("maybe");
  }

  // If any field caused a "maybe", overall result is "maybe"
  if (checks.includes("maybe")) return "maybe";

  return "eligible";
}

// Runs the check against a list of schemes, splits into eligible/maybe
export function runEligibility(schemes, profile) {
  const eligible = [];
  const maybe = [];

  for (const scheme of schemes) {
    const result = checkSchemeEligibility(scheme, profile);
    if (result === "eligible") eligible.push(scheme);
    else if (result === "maybe") maybe.push(scheme);
    // "not_eligible" schemes are dropped
  }

  return { eligible, maybe };
}