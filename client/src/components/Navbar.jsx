import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";

const pillClass = ({ isActive }) =>
  `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
    isActive ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-700"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, lang, toggleLang } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 pt-3 flex items-center justify-between gap-3">
        <Link to="/" className="font-bold text-lg text-blue-800 leading-tight">
          {t("appName")}
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={t("switchLanguage")}
            className="min-h-10 px-3 rounded-full border border-blue-700 text-blue-700 text-sm font-semibold"
          >
            {lang === "hi" ? "English" : "हिन्दी"}
          </button>

          {user ? (
            <button
              type="button"
              onClick={logout}
              className="min-h-10 px-3 rounded-full text-sm text-red-600"
            >
              {t("logout")}
            </button>
          ) : (
            <Link
              to="/login"
              className="min-h-10 px-4 rounded-full bg-blue-700 text-white text-sm font-semibold inline-flex items-center"
            >
              {t("login")}
            </Link>
          )}
        </div>
      </div>

      <nav className="max-w-5xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
        <NavLink to="/" end className={pillClass}>
          {t("navHome")}
        </NavLink>
        <NavLink to="/schemes" className={pillClass}>
          {t("navSchemes")}
        </NavLink>
        {user && (
          <NavLink to="/saved" className={pillClass}>
            {t("navSaved")}
          </NavLink>
        )}
      </nav>
    </header>
  );
}