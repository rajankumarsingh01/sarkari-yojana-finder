import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BIHAR_DISTRICTS, CATEGORIES } from "../data/constants";
import { useLanguage } from "../i18n/LanguageContext";

export default function Home() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [district, setDistrict] = useState(""); // "" = all Bihar

  // Districts sorted in the order of the chosen language
  const districts = useMemo(
    () => [...BIHAR_DISTRICTS].sort((a, b) => a[lang].localeCompare(b[lang], lang)),
    [lang]
  );

  function schemesUrl(extra = {}) {
    const params = new URLSearchParams();
    if (district) params.set("district", district);
    for (const [key, value] of Object.entries(extra)) params.set(key, value);
    const qs = params.toString();
    return qs ? `/schemes?${qs}` : "/schemes";
  }

  return (
    <div>
      <section className="bg-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-snug">{t("heroTitle")}</h1>
          <p className="text-blue-100">{t("heroSubtitle")}</p>

          <label className="flex flex-col gap-2 text-sm font-medium">
            {t("chooseDistrict")}
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full min-h-12 rounded-lg px-3 text-base text-gray-900 bg-white"
            >
              <option value="">{t("allBihar")}</option>
              {districts.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d[lang]}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => navigate(schemesUrl())}
            className="min-h-12 rounded-lg bg-orange-500 text-white text-base font-bold"
          >
            {t("seeSchemes")}
          </button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">{t("browseByCategory")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.value}
              to={schemesUrl({ category: c.value })}
              className="flex flex-col items-center justify-center gap-1 min-h-24 bg-white rounded-xl border border-gray-200 p-3 text-center"
            >
              <span className="text-2xl" aria-hidden="true">
                {c.icon}
              </span>
              <span className="text-sm font-medium text-gray-800">{c[lang]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-8">
        <ul className="flex flex-col gap-3 text-sm text-gray-700">
          <li className="flex gap-2">
            <span aria-hidden="true">✅</span>
            <span>{t("trust1")}</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">⚠️</span>
            <span>{t("trust2")}</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">🆓</span>
            <span>{t("trust3")}</span>
          </li>
        </ul>
      </section>
    </div>
  );
}