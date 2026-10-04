import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);
const STORAGE_KEY = "lang";

// Hindi is the default. A saved choice (if any) wins.
function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "hi" || saved === "en") return saved;
  } catch {
    // storage blocked (private mode etc.): just use the default
  }
  return "hi";
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translations[lang].appName;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  // UI text: t("navHome")
  function t(key) {
    return translations[lang][key] ?? translations.en[key] ?? key;
  }

  // Bilingual API field like { en, hi }: fall back to English if Hindi is missing
  function bi(field) {
    if (!field) return null;
    return field[lang] || field.en || null;
  }

  function toggleLang() {
    setLang((current) => (current === "hi" ? "en" : "hi"));
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, bi }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook lives next to its provider on purpose (same pattern as AuthContext).
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  return useContext(LanguageContext);
}