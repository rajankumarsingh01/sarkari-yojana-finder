import { STOPWORDS, SYNONYM_GROUPS } from "../constants/searchSynonyms.js";

const MAX_TERMS = 30;

// Lowercase, Unicode-normalise, and drop the Hindi nukta mark so that
// "बाढ़" and "बाढ" are treated as the same word.
function normalizeWord(word) {
  return word.normalize("NFC").toLowerCase().replace(/\u093C/g, "");
}

const STOP_SET = new Set(STOPWORDS.map(normalizeWord));

// word -> list of extra search terms
const SYNONYM_MAP = new Map();
for (const group of SYNONYM_GROUPS) {
  for (const word of group.words) {
    const key = normalizeWord(word);
    SYNONYM_MAP.set(key, [...(SYNONYM_MAP.get(key) || []), ...group.expand]);
  }
}

// Turns what the user typed into a list of safe search terms.
// Only letters, marks and digits survive, so quotes, "-" (MongoDB's NOT) and
// "$" can never reach the $text query.
export function buildSearchTerms(input) {
  const cleaned = String(input)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ");

  const terms = new Set();

  for (const token of cleaned.split(/\s+/).filter(Boolean)) {
    const key = normalizeWord(token);
    if (key.length < 2 || STOP_SET.has(key)) continue;

    terms.add(token);
    if (key !== token) terms.add(key);

    // simple English plural: "farmers" also searches "farmer"
    const singular = /^[a-z]+$/.test(key) && key.length > 3 && key.endsWith("s") ? key.slice(0, -1) : null;
    if (singular) terms.add(singular);

    for (const extra of SYNONYM_MAP.get(key) || SYNONYM_MAP.get(singular) || []) {
      terms.add(extra);
    }
  }

  return [...terms].slice(0, MAX_TERMS);
}

// Value for MongoDB $text.$search, or null when nothing searchable is left.
export function toTextSearch(input) {
  const terms = buildSearchTerms(input);
  return terms.length > 0 ? terms.join(" ") : null;
}