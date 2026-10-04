import api from "./axios";

export async function getSavedSchemes() {
  const res = await api.get("/saved");
  return res.data;
}

export async function saveScheme(schemeSlug) {
  const res = await api.post("/saved", { schemeSlug });
  return res.data;
}

export async function unsaveScheme(slug) {
  const res = await api.delete(`/saved/${slug}`);
  return res.data;
}