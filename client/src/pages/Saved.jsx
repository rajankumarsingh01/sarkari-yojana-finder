import { useEffect, useState } from "react";
import { getSavedSchemes } from "../lib/saved";
import SchemeCard from "../componenets/SchemeCard";

export default function Saved() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getSavedSchemes();
      setSchemes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Saved Schemes</h2>
      <div className="grid gap-4">
        {schemes.map((scheme) => (
          <SchemeCard
            key={scheme.slug}
            scheme={scheme}
            isSaved={true}
            onSaveChange={load}
          />
        ))}
        {schemes.length === 0 && (
          <p className="text-gray-500 text-sm">No saved schemes yet.</p>
        )}
      </div>
    </div>
  );
}