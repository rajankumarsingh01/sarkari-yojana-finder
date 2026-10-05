import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SchemeCard from "../components/SchemeCard";
import { useLanguage } from "../i18n/LanguageContext";
import { getSavedSchemes, unsaveScheme } from "../lib/saved";

export default function Saved() {
  const { t } = useLanguage();
  const [state, setState] = useState({ loading: true, items: [], failed: false });

  useEffect(() => {
    let active = true;
    getSavedSchemes()
      .then((items) => {
        if (active) setState({ loading: false, items, failed: false });
      })
      .catch(() => {
        if (active) setState({ loading: false, items: [], failed: true });
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleUnsave(slug) {
    try {
      await unsaveScheme(slug);
      setState((prev) => ({ ...prev, items: prev.items.filter((s) => s.slug !== slug) }));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">{t("savedTitle")}</h1>

      {state.loading && <p className="py-8 text-center text-gray-600">{t("loading")}</p>}

      {!state.loading && state.failed && (
        <p className="py-8 text-center text-red-700">{t("loadError")}</p>
      )}

      {!state.loading && !state.failed && state.items.length === 0 && (
        <div className="py-8 text-center flex flex-col gap-3">
          <p className="text-gray-600">{t("savedEmpty")}</p>
          <Link to="/schemes" className="text-blue-700 font-medium underline">
            {t("navSchemes")}
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {state.items.map((scheme) => (
          <SchemeCard key={scheme.slug} scheme={scheme} isSaved={true} onToggleSave={handleUnsave} />
        ))}
      </div>
    </div>
  );
}