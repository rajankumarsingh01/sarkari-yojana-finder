import api from "./axios";

// GET /api/schemes?district=&category=&status=&page=
export async function fetchSchemes(params, signal) {
  const res = await api.get("/schemes", { params, signal });
  return res.data; // { items, page, limit, total, totalPages }
}

// GET /api/schemes/:slug
export async function fetchScheme(slug, signal) {
  const res = await api.get(`/schemes/${encodeURIComponent(slug)}`, { signal });
  return res.data;
}