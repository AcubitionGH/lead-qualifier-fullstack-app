"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { UsageStatus } from "@/lib/types";

export default function PricingPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const canceled = searchParams.get("canceled") === "1";

  const [usage, setUsage] = useState<UsageStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/usage").then((r) => r.json()).then(setUsage);
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  };

  const handlePortal = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0d1117] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#e6edf3] tracking-tight">Pricing</h1>
          <p className="mt-3 text-[#8b949e]">Simple, transparent pricing</p>
        </div>

        {success && (
          <div className="mb-6 text-center bg-green-950/30 border border-green-800/40 rounded-xl py-3 px-4 text-green-400 text-sm font-medium">
            You&apos;re now on Pro. Enjoy unlimited qualifications!
          </div>
        )}
        {canceled && (
          <div className="mb-6 text-center bg-[#1c2333] border border-[#30363d] rounded-xl py-3 px-4 text-[#8b949e] text-sm">
            Checkout canceled — no charge was made.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium text-[#8b949e] uppercase tracking-wide mb-1">Free</p>
              <p className="text-3xl font-bold text-[#e6edf3]">$0</p>
              <p className="text-sm text-[#8b949e] mt-1">forever</p>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-[#8b949e]">
              <Feature>2 qualifications per day</Feature>
              <Feature>Full AI analysis</Feature>
              <Feature>Lead history</Feature>
            </ul>
            <div className="mt-auto pt-2">
              {usage && !usage.isPro && (
                <p className="text-xs text-[#484f58] text-center">{usage.usageToday} / 2 used today</p>
              )}
              {usage?.isPro && (
                <p className="text-xs text-[#484f58] text-center">You&apos;re on Pro</p>
              )}
            </div>
          </div>

          {/* Pro */}
          <div className="bg-[#161b22] border border-[#1d6dd4] rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#1d6dd4] text-white text-[10px] font-semibold px-3 py-1 rounded-bl-lg tracking-wide uppercase">
              Popular
            </div>
            <div>
              <p className="text-xs font-medium text-[#58a6ff] uppercase tracking-wide mb-1">Pro</p>
              <p className="text-3xl font-bold text-[#e6edf3]">$29</p>
              <p className="text-sm text-[#8b949e] mt-1">per month</p>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-[#8b949e]">
              <Feature highlight>Unlimited qualifications</Feature>
              <Feature>Full AI analysis</Feature>
              <Feature>Lead history</Feature>
            </ul>
            <div className="mt-auto pt-2">
              {usage?.isPro ? (
                <button
                  onClick={handlePortal}
                  disabled={loading}
                  className="w-full border border-[#30363d] hover:border-[#484f58] text-[#8b949e] hover:text-[#e6edf3] font-medium py-2.5 rounded-lg transition-all text-sm disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Manage Subscription"}
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full bg-[#1d6dd4] hover:bg-[#1f7aec] text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-[#1d6dd4]/20 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Upgrade to Pro"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span className={highlight ? "text-[#58a6ff]" : "text-[#3fb950]"}>✓</span>
      <span className={highlight ? "text-[#e6edf3]" : ""}>{children}</span>
    </li>
  );
}
