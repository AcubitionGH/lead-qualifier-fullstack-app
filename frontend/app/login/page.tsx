"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email to confirm your account, then sign in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  };

  const inputClass =
    "w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#1d6dd4] focus:ring-1 focus:ring-[#1d6dd4] transition-colors hover:border-[#484f58]";

  return (
    <main className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1c2333] border border-[#30363d] rounded-full px-4 py-1.5 text-xs text-[#58a6ff] font-medium mb-5 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse" />
            AI Powered
          </div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">Lead Qualifier</h1>
          <p className="text-[#8b949e] text-sm mt-1">
            {mode === "signin" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 space-y-4 shadow-xl shadow-black/40"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#8b949e] uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/40 rounded-lg py-2 px-3">
              {error}
            </p>
          )}
          {message && (
            <p className="text-green-400 text-sm bg-green-950/30 border border-green-900/40 rounded-lg py-2 px-3">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1d6dd4] hover:bg-[#1f7aec] active:scale-[0.98] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-150 shadow-lg shadow-[#1d6dd4]/20 hover:shadow-[#1d6dd4]/40 mt-2"
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-[#8b949e] mt-5">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}
            className="text-[#58a6ff] hover:text-[#79b8ff] transition-colors font-medium"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </main>
  );
}
