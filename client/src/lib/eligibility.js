import api from "./axios";

export async function checkEligibility(profile) {
  const res = await api.post("/eligibility", profile);
  return res.data; // { eligible: [...], maybe: [...] }
}