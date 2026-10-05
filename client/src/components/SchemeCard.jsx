import { useState } from "react";
import { Link } from "react-router-dom";
import { STATUS_LABELS } from "../data/constants";
import { useLanguage } from "../i18n/LanguageContext";
import { formatAmount, formatDate } from "../lib/format";

const STATUS_COLORS = {
  OPEN: "bg-green-100 text-green-800",
  ONGOING: "bg-green-100 text-green-800",
  UPCOMING: "bg-blue-100 text-blue-800",
  CLOSED: "bg-gray-200 text-gray-700",
  UNKNOWN: "bg-gray-100 text-gray-600",
};

function Chip({ className = "bg-gray-100 text-gray-700", children }) {
  return <span className={`text-xs px-2 py-1 rounded-full ${className}`}>{children}</span>;
}

// onToggleSave is optional: when it is missing (guest user) no save button is shown.
export default function SchemeCard({ scheme, isSaved = false, onToggleSave }) {
  const { t, lang, bi } = useLanguage();
  const [busy, setBusy] = useState(false);

  const status = STATUS_LABELS[scheme.schemeStatus] ? scheme.schemeStatus : "UNKNOWN";
  const summary = bi(scheme.summary);
  const benefitText = scheme.benefit?.amountText || formatAmount(scheme.benefit?.amount);
  const deadline = formatDate(scheme.deadline, lang);
  const lastVerified = formatDate(scheme.verification?.lastVerifiedAt, lang);
  const source = scheme.sources?.find((s) => s.isPrimary) || scheme.sources?.[0];

  async function handleToggle() {
    setBusy(true);
    try {
      await onToggleSave(scheme.slug);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Chip>{t(`level${scheme.level}`)}</Chip>
        <Chip>{t(`coverage${scheme.coverage}`)}</Chip>
        <Chip className={STATUS_COLORS[status]}>{STATUS_LABELS[status][lang]}</Chip>
        {!lastVerified && <Chip className="bg-red-100 text-red-700">{t("unverified")}</Chip>}
      </div>

      <h3 className="text-base font-bold text-gray-900">{bi(scheme.title)}</h3>

      {summary && <p className="text-sm text-gray-700 line-clamp-3">{summary}</p>}

      <dl className="text-sm text-gray-700 flex flex-col gap-1">
        {benefitText && (
          <div>
            <dt className="inline font-medium">{t("benefit")}: </dt>
            <dd className="inline">{benefitText}</dd>
          </div>
        )}
        {deadline && (
          <div>
            <dt className="inline font-medium">{t("deadline")}: </dt>
            <dd className="inline">{deadline}</dd>
          </div>
        )}
        {lastVerified && (
          <div>
            <dt className="inline font-medium">{t("lastVerified")}: </dt>
            <dd className="inline">{lastVerified}</dd>
          </div>
        )}
      </dl>

      {source && (
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer noopener"
          className="text-sm text-blue-700 underline break-all"
        >
          {t("officialSource")}: {source.domain || source.url}
        </a>
      )}

      <div className="flex items-center gap-2 mt-1">
        <Link
          to={`/schemes/${scheme.slug}`}
          className="flex-1 min-h-11 rounded-lg bg-blue-700 text-white text-sm font-semibold inline-flex items-center justify-center"
        >
          {t("viewDetails")}
        </Link>
        {onToggleSave && (
          <button
            type="button"
            onClick={handleToggle}
            disabled={busy}
            className="min-h-11 px-4 rounded-lg border border-blue-700 text-blue-700 text-sm font-semibold disabled:opacity-50"
          >
            {isSaved ? t("unsave") : t("save")}
          </button>
        )}
      </div>
    </article>
  );
}