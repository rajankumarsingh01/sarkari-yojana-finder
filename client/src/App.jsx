import { Routes, Route, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SchemeList from "./pages/SchemeList";
import SchemeDetail from "./pages/SchemeDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Saved from "./pages/Saved";
import { useAuth } from "./context/AuthContext";
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  if (loading) return <p className="text-center mt-10 text-gray-500">{t("loading")}</p>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-gray-200 bg-white">
      <p className="max-w-5xl mx-auto px-4 py-4 text-xs text-gray-600">
        {t("footerDisclaimer")}
      </p>
    </footer>
  );
}

function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-center">
      <h1 className="text-xl font-bold text-gray-800 mb-2">{t("notFoundTitle")}</h1>
      <p className="text-gray-600 mb-4">{t("notFoundBody")}</p>
      <Link to="/" className="text-blue-700 font-medium underline">
        {t("backHome")}
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schemes" element={<SchemeList />} />
            <Route path="/schemes/:slug" element={<SchemeDetail />} />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <Saved />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}