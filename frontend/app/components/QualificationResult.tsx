"use client";

import type { QualificationResult } from "@/lib/types";

const TIER_CONFIG: Record<QualificationResult["tier"], {
  border: string; badge: string; badgeText: string; bar: string; label: string;
}> = {
  hot:          { border: "border-red-500/30",    badge: "bg-red-500/10 border-red-500/30",    badgeText: "text-red-400",    bar: "bg-red-500",    label: "🔥 Hot" },
  warm:         { border: "border-orange-500/30", badge: "bg-orange-500/10 border-orange-500/30", badgeText: "text-orange-400", bar: "bg-orange-400", label: "🌤 Warm" },
  cold:         { border: "border-blue-500/30",   badge: "bg-blue-500/10 border-blue-500/30",   badgeText: "text-blue-400",   bar: "bg-blue-400",   label: "🧊 Cold" },
  disqualified: { border: "border-[#30363d]",     badge: "bg-[#1c2333] border-[#30363d]",       badgeText: "text-[#8b949e]",  bar: "bg-[#484f58]",  label: "✗ Disqualified" },
};

export default function QualificationResultComponent({ result }: { result: QualificationResult }) {
  const cfg = TIER_CONFIG[result.tier];

  return (
    <div className={`bg-[#161b22] rounded-2xl border ${cfg.border} p-8 space-y-6 shadow-xl shadow-black/40`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#e6edf3]">Qualification Result</h2>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${cfg.badge} ${cfg.badgeText}`}>
          {cfg.label}
        </span>
      </div>

      {/* Score */}
      <div>
        <div className="flex justify-between text-xs text-[#8b949e] mb-2">
          <span>Score</span>
          <span className="font-semibold text-[#e6edf3]">{result.score} / 100</span>
        </div>
        <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
            style={{ width: `${result.score}%` }}
          />
        </div>
      </div>

      {/* Summary */}
      <p className="text-[#8b949e] text-sm leading-relaxed">{result.summary}</p>

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#0d1117] rounded-xl border border-[#21262d] p-4 hover:border-[#30363d] transition-colors">
          <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-3">Strengths</h3>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="text-sm text-[#8b949e] flex gap-2 items-start">
                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#0d1117] rounded-xl border border-[#21262d] p-4 hover:border-[#30363d] transition-colors">
          <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">Concerns</h3>
          <ul className="space-y-2">
            {result.concerns.map((c, i) => (
              <li key={i} className="text-sm text-[#8b949e] flex gap-2 items-start">
                <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Action */}
      <div className="bg-[#0d1117] rounded-xl border border-[#1d6dd4]/30 p-4 hover:border-[#1d6dd4]/60 transition-colors">
        <h3 className="text-xs font-semibold text-[#58a6ff] uppercase tracking-wide mb-1">Recommended Action</h3>
        <p className="text-sm text-[#8b949e]">{result.recommendedAction}</p>
      </div>

    </div>
  );
}
