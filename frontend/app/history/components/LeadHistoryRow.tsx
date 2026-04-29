"use client";

import { useState } from "react";
import type { SavedLead } from "@/lib/types";

const TIER_CONFIG = {
  hot:          { badge: "bg-red-500/10 border-red-500/30 text-red-400",    bar: "bg-red-500",    label: "🔥 Hot" },
  warm:         { badge: "bg-orange-500/10 border-orange-500/30 text-orange-400", bar: "bg-orange-400", label: "🌤 Warm" },
  cold:         { badge: "bg-blue-500/10 border-blue-500/30 text-blue-400",  bar: "bg-blue-400",   label: "🧊 Cold" },
  disqualified: { badge: "bg-[#1c2333] border-[#30363d] text-[#8b949e]",    bar: "bg-[#484f58]",  label: "✗ Disq." },
};

export default function LeadHistoryRow({ lead }: { lead: SavedLead }) {
  const [open, setOpen] = useState(false);
  const cfg = TIER_CONFIG[lead.tier];
  const date = new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="border border-[#21262d] rounded-xl overflow-hidden hover:border-[#30363d] transition-colors">
      {/* Row header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 bg-[#161b22] hover:bg-[#1c2333] transition-colors text-left"
      >
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${cfg.badge}`}>
          {cfg.label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#e6edf3] truncate">{lead.company_name}</p>
          <p className="text-xs text-[#484f58] truncate">{lead.contact_name} · {lead.contact_email}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#e6edf3]">{lead.score}<span className="text-[#484f58] font-normal">/100</span></p>
            <p className="text-xs text-[#484f58]">{date}</p>
          </div>
          <span className={`text-[#484f58] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
        </div>
      </button>

      {/* Expanded details */}
      {open && (
        <div className="px-5 py-4 bg-[#0d1117] space-y-4 border-t border-[#21262d]">
          {/* Score bar */}
          <div>
            <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${lead.score}%` }} />
            </div>
          </div>

          <p className="text-sm text-[#8b949e] leading-relaxed">{lead.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#161b22] rounded-lg border border-[#21262d] p-3">
              <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">Strengths</h4>
              <ul className="space-y-1">
                {lead.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-[#8b949e] flex gap-1.5">
                    <span className="text-green-500 shrink-0">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#161b22] rounded-lg border border-[#21262d] p-3">
              <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">Concerns</h4>
              <ul className="space-y-1">
                {lead.concerns.map((c, i) => (
                  <li key={i} className="text-xs text-[#8b949e] flex gap-1.5">
                    <span className="text-red-500 shrink-0">✗</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#161b22] rounded-lg border border-[#1d6dd4]/30 p-3">
            <h4 className="text-xs font-semibold text-[#58a6ff] uppercase tracking-wide mb-1">Recommended Action</h4>
            <p className="text-xs text-[#8b949e]">{lead.recommended_action}</p>
          </div>
        </div>
      )}
    </div>
  );
}
