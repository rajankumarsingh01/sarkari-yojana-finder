// Dates are shown in Indian time so "last date" never shifts by a day.
export function formatDate(value, lang) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function formatAmount(amount) {
  if (amount === null || amount === undefined) return null;
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}