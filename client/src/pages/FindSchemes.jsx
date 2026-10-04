import { useState } from "react";
import { checkEligibility } from "../lib/eligibility";
import { getSavedSchemes } from "../lib/saved";
import SchemeCard from "../components/SchemeCard";
import { useEffect } from "react";

const initialForm = {
  age: "",
  state: "",
  occupation: "",
  gender: "",
  annualIncome: "",
  socialCategory: "",
};

export default function FindSchemes() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null); // { eligible, maybe }
  const [savedSlugs, setSavedSlugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSaved();
  }, []);

  async function loadSaved() {
    try {
      const saved = await getSavedSchemes();
      setSavedSlugs(saved.map((s) => s.slug));
    } catch (err) {
      // not logged in, ignore silently
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Empty fields ko backend ko bhejte hi nahi (optional fields hain)
    const payload = {};
    if (form.age) payload.age = Number(form.age);
    if (form.state) payload.state = form.state;
    if (form.occupation) payload.occupation = form.occupation;
    if (form.gender) payload.gender = form.gender;
    if (form.annualIncome) payload.annualIncome = Number(form.annualIncome);
    if (form.socialCategory) payload.socialCategory = form.socialCategory;

    try {
      const data = await checkEligibility(payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <p className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded mb-6 border border-yellow-200">
        ⚠️ Informational only. Verify all details on the official portal before applying.
      </p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Find Schemes</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="age"
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="state"
            placeholder="State (e.g. Bihar)"
            value={form.state}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="occupation"
            placeholder="Occupation (e.g. farmer)"
            value={form.occupation}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Gender (optional)</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input
            name="annualIncome"
            type="number"
            placeholder="Annual Income (INR)"
            value={form.annualIncome}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="socialCategory"
            placeholder="Category (e.g. SC/ST/OBC/General)"
            value={form.socialCategory}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Checking..." : "Find Schemes"}
        </button>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </form>

      {result && (
        <div className="flex flex-col gap-6">
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Eligible ({result.eligible.length})
            </h3>
            <div className="grid gap-4">
              {result.eligible.map((scheme) => (
                <SchemeCard
                  key={scheme.slug}
                  scheme={scheme}
                  status="eligible"
                  isSaved={savedSlugs.includes(scheme.slug)}
                  onSaveChange={loadSaved}
                />
              ))}
              {result.eligible.length === 0 && (
                <p className="text-gray-500 text-sm">No clear matches yet.</p>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Maybe Eligible ({result.maybe.length})
            </h3>
            <div className="grid gap-4">
              {result.maybe.map((scheme) => (
                <SchemeCard
                  key={scheme.slug}
                  scheme={scheme}
                  status="maybe"
                  isSaved={savedSlugs.includes(scheme.slug)}
                  onSaveChange={loadSaved}
                />
              ))}
              {result.maybe.length === 0 && (
                <p className="text-gray-500 text-sm">Nothing here.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}