import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SchemeCard from "../components/SchemeCard";
import { BIHAR_DISTRICTS, CATEGORIES, STATUS_LABELS } from "../data/constants";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { fetchSchemes } from "../lib/schemes";
import { getSavedSchemes, saveScheme, unsaveScheme } from "../lib/saved";

const selectClass = "w-full min-h-12 rounded-lg px-3 text-base text-gray-900 bg-white border border-gray-300";

// Only accept values we know. A bad value typed into the URL is ignored.
function pick(value, allowed) {
  return allowed.includes(value) ? value : "";
}

export default function SchemeList() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const district = pick(searchParams.get("district"), BIHAR_DISTRICTS.map((d) => d.slug));
  const category = pick(searchParams.get("category"), CATEGORIES.map((c) => c.value));
  const status = pick(searchParams.get("status"), Object.keys(STATUS_LABELS));
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, failed: false });
  const [slowKey, setSlowKey] = useState(null);
  const [savedSlugs, setSavedSlugs] = useState([]);

  // Every distinct request gets its own key. "loading" = latest key has no result yet.
  const requestKey = `${district}|${category}|${status}|${page}|${retry}`;
  const loading = result.key !== requestKey;
  const slow = loading && slowKey === requestKey;

  useEffect(() => {
    let active = true; // ignore answers of old requests (user changed filters quickly)
    const params = { page };
    if (district) params.district = district;
    if (category) params.category = category;
    if (status) params.status = status;

    const slowTimer = setTimeout(() => setSlowKey(requestKey), 4000);

    fetchSchemes(params)
      .then((data) => {
        if (active) setResult({ key: requestKey, data, failed: false });
      })
      .catch(() => {
        if (active) setResult({ key: requestKey, data: null, failed: true });
      })
      .finally(() => clearTimeout(slowTimer));

    return () => {
      active = false;
      clearTimeout(slowTimer);
    };
  }, [requestKey, district, category, status, page]);

  // Saved slugs are needed only for logged-in users (to show Save / Unsave)
  useEffect(() => {
    if (!user) return;
    getSavedSchemes()
      .then((saved) => setSavedSlugs(saved.map((s) => s.slug)))
      .catch(() => {});
  }, [user]);

  const districts = useMemo(
    () => [...BIHAR_DISTRICTS].sort((a, b) => a[lang].localeCompare(b[lang], lang)),
    [lang]
  );

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page"); // a new filter always starts from page 1
    setSearchParams(next);
  }

  function goToPage(newPage) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0 });
  }

  async function toggleSave(slug) {
    try {
      if (savedSlugs.includes(slug)) {
        await unsaveScheme(slug);
        setSavedSlugs((prev) => prev.filter((s) => s !== slug));
      } else {
        await saveScheme(slug);
        setSavedSlugs((prev) => [...prev, slug]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const data = result.data;
  const hasFilters = Boolean(district || category || status);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">{t("schemesTitle")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          {t("filterDistrict")}
          <select
            value={district}
            onChange={(e) => updateParam("district", e.target.value)}
            className={selectClass}
          >
            <option value="">{t("allBihar")}</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d[lang]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          {t("filterCategory")}
          <select
            value={category}
            onChange={(e) => updateParam("category", e.target.value)}
            className={selectClass}
          >
            <option value="">{t("filterAll")}</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c[lang]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          {t("filterStatus")}
          <select
            value={status}
            onChange={(e) => updateParam("status", e.target.value)}
            className={selectClass}
          >
            <option value="">{t("filterAll")}</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label[lang]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className="self-start min-h-10 px-4 rounded-full border border-gray-400 text-sm text-gray-700"
        >
          {t("clearFilters")}
        </button>
      )}

      {loading && (
        <div className="py-8 text-center text-gray-600">
          <p>{t("loading")}</p>
          {slow && <p className="mt-2 text-sm">{t("serverWaking")}</p>}
        </div>
      )}

      {!loading && result.failed && (
        <div className="py-8 text-center">
          <p className="text-red-700 mb-3">{t("loadError")}</p>
          <button
            type="button"
            onClick={() => setRetry((n) => n + 1)}
            className="min-h-11 px-5 rounded-lg bg-blue-700 text-white font-semibold"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {!loading && data && (
        <>
          <p className="text-sm text-gray-600">
            {data.total} {t("resultsFound")}
          </p>

          {data.items.length === 0 ? (
            <p className="py-8 text-center text-gray-600">{t("noSchemes")}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {data.items.map((scheme) => (
                <SchemeCard
                  key={scheme.slug}
                  scheme={scheme}
                  isSaved={savedSlugs.includes(scheme.slug)}
                  onToggleSave={user ? toggleSave : undefined}
                />
              ))}
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={data.page <= 1}
                onClick={() => goToPage(data.page - 1)}
                className="min-h-11 px-4 rounded-lg border border-blue-700 text-blue-700 font-semibold disabled:opacity-40"
              >
                {t("prevPage")}
              </button>
              <span className="text-sm text-gray-700">
                {t("page")} {data.page} / {data.totalPages}
              </span>
              <button
                type="button"
                disabled={data.page >= data.totalPages}
                onClick={() => goToPage(data.page + 1)}
                className="min-h-11 px-4 rounded-lg border border-blue-700 text-blue-700 font-semibold disabled:opacity-40"
              >
                {t("nextPage")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}