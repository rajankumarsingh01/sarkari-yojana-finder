import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { STATUS_LABELS } from "../data/constants";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { fetchScheme } from "../lib/schemes";
import { getSavedSchemes, saveScheme, unsaveScheme } from "../lib/saved";
import { formatAmount, formatDate } from "../lib/format";

const STATUS_COLORS = {
  OPEN: "bg-green-100 text-green-800",
  ONGOING: "bg-green-100 text-green-800",
  UPCOMING: "bg-blue-100 text-blue-800",
  CLOSED: "bg-gray-200 text-gray-700",
  UNKNOWN: "bg-gray-100 text-gray-600",
};

// [rule key in scheme.eligibility, translation key of its label]
const RULES = [
  ["age", "eligAge"],
  ["gender", "eligGender"],
  ["occupations", "eligOccupation"],
  ["income", "eligIncome"],
  ["residence", "eligResidence"],
  ["socialCategories", "eligCategory"],
  ["disability", "eligDisability"],
  ["educationLevels", "eligEducation"],
];

// Only http(s) links are ever turned into clickable links.
function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Returns readable text for one rule, or null when the source did not specify it.
function ruleText(key, rule, t) {
  if (!rule || rule.mode === "UNSPECIFIED") return null;
  if (rule.mode === "ANY") return t("anyone");

  if (key === "age") {
    if (rule.min != null && rule.max != null) return `${rule.min}–${rule.max} ${t("years")}`;
    if (rule.min != null) return `${rule.min}+ ${t("years")}`;
    return `${t("upTo")} ${rule.max} ${t("years")}`;
  }
  if (key === "income") {
    if (rule.min != null && rule.max != null) {
      return `${formatAmount(rule.min)} – ${formatAmount(rule.max)}`;
    }
    if (rule.min != null) return `${formatAmount(rule.min)}+`;
    return `${t("upTo")} ${formatAmount(rule.max)}`;
  }
  if (key === "disability") {
    return rule.mode === "REQUIRED" ? t("disabilityRequired") : t("disabilityNotRequired");
  }
  if (key === "gender") return rule.values.map((v) => t(`gender${v}`)).join(", ");
  if (key === "residence") return rule.values.map((v) => t(`residence${v}`)).join(", ");
  return rule.values.join(", ");
}

function Section({ title, children }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }) {
  return (
    <p className="text-sm text-gray-800">
      <span className="font-medium">{label}: </span>
      {children}
    </p>
  );
}

function NotSpecified({ t }) {
  return <p className="text-sm text-gray-500 italic">{t("notSpecified")}</p>;
}

export default function SchemeDetail() {
  const { slug } = useParams();
  const { t, lang, bi } = useLanguage();
  const { user } = useAuth();

  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ key: null, scheme: null, error: null });
  const [slowKey, setSlowKey] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  const requestKey = `${slug}|${retry}`;
  const loading = result.key !== requestKey;
  const slow = loading && slowKey === requestKey;

  useEffect(() => {
    let active = true;
    const slowTimer = setTimeout(() => setSlowKey(requestKey), 4000);

    fetchScheme(slug)
      .then((scheme) => {
        if (active) setResult({ key: requestKey, scheme, error: null });
      })
      .catch((err) => {
        const status = err.response?.status;
        const error = status === 404 || status === 400 ? "notFound" : "failed";
        if (active) setResult({ key: requestKey, scheme: null, error });
      })
      .finally(() => clearTimeout(slowTimer));

    return () => {
      active = false;
      clearTimeout(slowTimer);
    };
  }, [requestKey, slug]);

  // Is this scheme already saved? (logged-in users only)
  useEffect(() => {
    if (!user) return;
    getSavedSchemes()
      .then((saved) => setIsSaved(saved.some((s) => s.slug === slug)))
      .catch(() => {});
  }, [user, slug]);

  async function toggleSave() {
    setSaveBusy(true);
    try {
      if (isSaved) {
        await unsaveScheme(slug);
        setIsSaved(false);
      } else {
        await saveScheme(slug);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveBusy(false);
    }
  }

  const backLink = (
    <Link to="/schemes" className="text-blue-700 font-medium underline text-sm">
      {t("backToList")}
    </Link>
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center text-gray-600">
        <p>{t("loading")}</p>
        {slow && <p className="mt-2 text-sm">{t("serverWaking")}</p>}
      </div>
    );
  }

  if (result.error === "notFound") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center flex flex-col gap-3">
        <p className="text-gray-800">{t("schemeNotFound")}</p>
        <div>{backLink}</div>
      </div>
    );
  }

  if (result.error === "failed") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center flex flex-col items-center gap-3">
        <p className="text-red-700">{t("loadError")}</p>
        <button
          type="button"
          onClick={() => setRetry((n) => n + 1)}
          className="min-h-11 px-5 rounded-lg bg-blue-700 text-white font-semibold"
        >
          {t("retry")}
        </button>
        {backLink}
      </div>
    );
  }

  const scheme = result.scheme;
  const status = STATUS_LABELS[scheme.schemeStatus] ? scheme.schemeStatus : "UNKNOWN";
  const summary = bi(scheme.summary);
  const lastVerified = formatDate(scheme.verification?.lastVerifiedAt, lang);
  const sources = scheme.sources || [];
  const primarySource = sources.find((s) => s.isPrimary) || sources[0];

  // Benefit
  const benefit = scheme.benefit || {};
  const benefitAmount = benefit.amountText || formatAmount(benefit.amount);
  const frequency = benefit.frequency && benefit.frequency !== "UNKNOWN" ? benefit.frequency : null;
  const hasBenefit = benefitAmount || frequency || benefit.description || benefit.paymentMethod;

  // Eligibility: show rules the source gave, and name the rest in one line
  const eligibility = scheme.eligibility || {};
  const givenRules = [];
  const missingLabels = [];
  for (const [key, labelKey] of RULES) {
    const text = ruleText(key, eligibility[key], t);
    if (text) givenRules.push({ label: t(labelKey), text });
    else missingLabels.push(t(labelKey));
  }
  const otherConditions = eligibility.otherConditions || [];

  // Dates
  const startDate = formatDate(scheme.startDate, lang);
  const deadline = formatDate(scheme.deadline, lang);
  const hasDates = startDate || deadline || scheme.notificationNumber;

  const documents = scheme.documents || [];
  const steps = scheme.applicationProcess || [];
  const canApplyOnline = scheme.applicationUrl && isHttpUrl(scheme.applicationUrl);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
      {backLink}

      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
          {t(`level${scheme.level}`)}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
          {t(`coverage${scheme.coverage}`)}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status][lang]}
        </span>
        {!lastVerified && (
          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
            {t("unverified")}
          </span>
        )}
      </div>

      <h1 className="text-xl font-bold text-gray-900">{bi(scheme.title)}</h1>
      {scheme.department && (
        <p className="text-sm text-gray-600">
          {t("department")}: {scheme.department}
        </p>
      )}
      {summary && <p className="text-gray-800">{summary}</p>}

      {user && (
        <button
          type="button"
          onClick={toggleSave}
          disabled={saveBusy}
          className="self-start min-h-11 px-5 rounded-lg border border-blue-700 text-blue-700 font-semibold disabled:opacity-50"
        >
          {isSaved ? t("unsave") : t("save")}
        </button>
      )}

      {/* Trust box: always visible, never hidden behind a tab */}
      <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 flex flex-col gap-2 text-sm text-gray-800">
        <p>{lastVerified ? `${t("lastVerified")}: ${lastVerified}` : t("notVerifiedYet")}</p>
        {primarySource && isHttpUrl(primarySource.url) && (
          <a
            href={primarySource.url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-blue-700 underline break-all"
          >
            {t("officialSource")}: {primarySource.domain || primarySource.url}
          </a>
        )}
        <p>{t("detailDisclaimer")}</p>
      </div>

      {scheme.officialDescription && (
        <Section title={t("officialDescription")}>
          <p className="text-sm text-gray-800 whitespace-pre-line">{scheme.officialDescription}</p>
        </Section>
      )}

      <Section title={t("sectionBenefit")}>
        {hasBenefit ? (
          <>
            {benefitAmount && <Row label={t("benefit")}>{benefitAmount}</Row>}
            {frequency && <p className="text-sm text-gray-800">{t(`freq${frequency}`)}</p>}
            {benefit.description && <p className="text-sm text-gray-800">{benefit.description}</p>}
            {benefit.paymentMethod && (
              <Row label={t("paymentMethod")}>{benefit.paymentMethod}</Row>
            )}
          </>
        ) : (
          <NotSpecified t={t} />
        )}
      </Section>

      <Section title={t("sectionEligibility")}>
        {givenRules.map((rule) => (
          <Row key={rule.label} label={rule.label}>
            {rule.text}
          </Row>
        ))}
        {otherConditions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-800">{t("eligOther")}:</p>
            <ul className="list-disc pl-5 text-sm text-gray-800">
              {otherConditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        {missingLabels.length > 0 && (
          <p className="text-sm text-gray-500 italic">
            {missingLabels.join(", ")}: {t("notSpecified")}
          </p>
        )}
      </Section>

      <Section title={t("sectionDocuments")}>
        {documents.length > 0 ? (
          <ul className="list-disc pl-5 text-sm text-gray-800">
            {documents.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        ) : (
          <NotSpecified t={t} />
        )}
      </Section>

      <Section title={t("sectionHowToApply")}>
        {steps.length > 0 && (
          <ol className="list-decimal pl-5 text-sm text-gray-800 flex flex-col gap-1">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        )}
        {scheme.offlineApplicationInfo && (
          <Row label={t("offlineInfo")}>{scheme.offlineApplicationInfo}</Row>
        )}
        {steps.length === 0 && !scheme.offlineApplicationInfo && !canApplyOnline && (
          <NotSpecified t={t} />
        )}
        {canApplyOnline && (
          <a
            href={scheme.applicationUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="min-h-12 rounded-lg bg-orange-500 text-white font-bold inline-flex items-center justify-center px-4"
          >
            {t("applyOnline")}
          </a>
        )}
      </Section>

      <Section title={t("sectionDates")}>
        {hasDates ? (
          <>
            {startDate && <Row label={t("startDate")}>{startDate}</Row>}
            {deadline && <Row label={t("deadline")}>{deadline}</Row>}
            {scheme.notificationNumber && (
              <Row label={t("notificationNumber")}>{scheme.notificationNumber}</Row>
            )}
          </>
        ) : (
          <NotSpecified t={t} />
        )}
      </Section>

      <Section title={t("sectionSources")}>
        <ul className="flex flex-col gap-3">
          {sources.map((source) => {
            const published = formatDate(source.publishedAt, lang);
            return (
              <li key={source.url} className="text-sm text-gray-800 flex flex-col gap-1">
                {source.isPrimary && (
                  <span className="text-xs w-fit px-2 py-1 rounded-full bg-green-100 text-green-800">
                    {t("primarySource")}
                  </span>
                )}
                <span className="font-medium">{source.title || source.domain}</span>
                {published && (
                  <span className="text-gray-600">
                    {t("published")}: {published}
                  </span>
                )}
                {isHttpUrl(source.url) && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-700 underline break-all"
                  >
                    {t("openSource")}: {source.domain || source.url}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}