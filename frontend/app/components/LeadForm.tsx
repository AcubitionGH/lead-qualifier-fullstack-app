"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LeadInput, QualificationResult, UsageStatus } from "@/lib/types";
import QualificationResultComponent from "./QualificationResult";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;
const FREE_LIMIT = 2;

type View = "form" | "loading" | "result";

const inputClass =
  "w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#1d6dd4] focus:ring-1 focus:ring-[#1d6dd4] transition-colors hover:border-[#484f58]";

const labelClass = "text-xs font-medium text-[#8b949e] uppercase tracking-wide";

export default function LeadForm() {
  const router = useRouter();
  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [form, setForm] = useState<LeadInput>({
    companyName: "",
    website: "",
    contactName: "",
    contactEmail: "",
    jobTitle: "",
    companySize: undefined,
    industry: "",
    useCase: "",
    notes: "",
  });
  const [result, setResult] = useState<QualificationResult | null>(null);
  const [view, setView] = useState<View>("form");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/usage").then((r) => r.json()).then(setUsage).catch(() => null);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setView("loading");

    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 402) {
        setView("form");
        router.push("/pricing");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong");
      }

      setResult(await res.json());
      setView("result");
      // Refresh usage after successful qualification
      fetch("/api/usage").then((r) => r.json()).then(setUsage).catch(() => null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setView("form");
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setForm({
      companyName: "",
      website: "",
      contactName: "",
      contactEmail: "",
      jobTitle: "",
      companySize: undefined,
      industry: "",
      useCase: "",
      notes: "",
    });
    setView("form");
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* FORM */}
      {view === "form" && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#161b22] rounded-2xl border border-[#30363d] p-8 space-y-5 shadow-xl shadow-black/40"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#e6edf3]">Lead Information</h2>
            {usage && !usage.isPro && (
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                usage.usageToday >= FREE_LIMIT
                  ? "bg-amber-950/30 border-amber-800/40 text-amber-400"
                  : "bg-[#0d1117] border-[#30363d] text-[#8b949e]"
              }`}>
                {usage.usageToday} / {FREE_LIMIT} today
              </span>
            )}
            {usage?.isPro && (
              <span className="text-xs px-2.5 py-1 rounded-full border bg-[#0d1117] border-[#1d6dd4] text-[#58a6ff] font-medium">
                Pro
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name *" name="companyName" value={form.companyName} onChange={handleChange} required />
            <Field label="Website" name="website" value={form.website ?? ""} onChange={handleChange} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Name *" name="contactName" value={form.contactName} onChange={handleChange} required />
            <Field label="Contact Email *" name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Job Title" name="jobTitle" value={form.jobTitle ?? ""} onChange={handleChange} />
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Company Size</label>
              <select
                name="companySize"
                value={form.companySize ?? ""}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select size</option>
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>{s} employees</option>
                ))}
              </select>
            </div>
          </div>

          <Field label="Industry" name="industry" value={form.industry ?? ""} onChange={handleChange} placeholder="e.g. SaaS, Healthcare, Finance" />

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Use Case</label>
            <textarea
              name="useCase"
              value={form.useCase ?? ""}
              onChange={handleChange}
              rows={3}
              placeholder="What do they want to use the product for?"
              className={inputClass + " resize-none"}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Additional Notes</label>
            <textarea
              name="notes"
              value={form.notes ?? ""}
              onChange={handleChange}
              rows={2}
              placeholder="Any extra context..."
              className={inputClass + " resize-none"}
            />
          </div>

          {usage && !usage.isPro && usage.usageToday >= FREE_LIMIT ? (
            <button
              type="button"
              onClick={() => router.push("/pricing")}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-lg transition-all duration-150 mt-2"
            >
              Upgrade to Analyze More Leads
            </button>
          ) : (
            <button
              type="submit"
              className="w-full bg-[#1d6dd4] hover:bg-[#1f7aec] active:scale-[0.98] text-white font-semibold py-3 rounded-lg transition-all duration-150 shadow-lg shadow-[#1d6dd4]/20 hover:shadow-[#1d6dd4]/40 mt-2"
            >
              Analyze Lead
            </button>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-950/30 border border-red-900/40 rounded-lg py-2 px-3">
              {error}
            </p>
          )}
        </form>
      )}

      {/* LOADING */}
      {view === "loading" && (
        <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-16 flex flex-col items-center gap-6 shadow-xl shadow-black/40">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-[#1d6dd4]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1d6dd4] animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-[#e6edf3] font-medium">Analyzing lead...</p>
            <p className="text-[#484f58] text-sm mt-1">This usually takes 10–20 seconds</p>
          </div>
        </div>
      )}

      {/* RESULT */}
      {view === "result" && result && (
        <div>
          <QualificationResultComponent result={result} />
          <button
            onClick={handleReset}
            className="mt-4 w-full border border-[#30363d] hover:border-[#484f58] hover:bg-[#161b22] text-[#8b949e] hover:text-[#e6edf3] font-medium py-3 rounded-lg transition-all duration-150 text-sm"
          >
            Qualify another lead
          </button>
        </div>
      )}

    </div>
  );
}

function Field({
  label, name, value, onChange, type = "text", required = false, placeholder,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelClass}>{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        required={required} placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}
