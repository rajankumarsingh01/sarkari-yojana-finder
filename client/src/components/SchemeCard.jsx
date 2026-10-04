import { useState } from "react";
import { saveScheme, unsaveScheme } from "../lib/saved";

// status: "eligible" | "maybe" | undefined (undefined = just showing a saved scheme)
export default function SchemeCard({ scheme, status, isSaved, onSaveChange }) {
  const [saving, setSaving] = useState(false);

  async function handleSaveToggle() {
    setSaving(true);
    try {
      if (isSaved) {
        await unsaveScheme(scheme.slug);
      } else {
        await saveScheme(scheme.slug);
      }
      onSaveChange?.(); // parent ko batao list refresh karne ke liye
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const badgeColor =
    status === "eligible"
      ? "bg-green-100 text-green-700"
      : status === "maybe"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700";

  const badgeText =
    status === "eligible" ? "Eligible" : status === "maybe" ? "Maybe Eligible" : "Saved";

  return (
    <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-800">{scheme.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>
          {badgeText}
        </span>
      </div>

      {!scheme.verified && (
        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full w-fit">
          UNVERIFIED
        </span>
      )}

      <p className="text-sm text-gray-600">{scheme.overview}</p>

      {scheme.benefits && (
        <p className="text-sm text-gray-700">
          <span className="font-medium">Benefits: </span>
          {scheme.benefits}
        </p>
      )}

      {scheme.documents?.length > 0 && (
        <p className="text-sm text-gray-700">
          <span className="font-medium">Documents: </span>
          {scheme.documents.join(", ")}
        </p>
      )}

      <div className="flex items-center gap-3 mt-2 text-sm">
        <a
          href={scheme.applyUrl}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline"
        >
          Apply
        </a>
        
         <a href={scheme.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-gray-500 hover:underline"
        >
          Source
        </a>
        <button
          onClick={handleSaveToggle}
          disabled={saving}
          className={`ml-auto px-3 py-1 rounded text-sm ${
            isSaved
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {saving ? "..." : isSaved ? "Unsave" : "Save"}
        </button>
      </div>
    </div>
  );
}