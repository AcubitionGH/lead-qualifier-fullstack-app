"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function Navbar({ email }: { email: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="border-b border-[#21262d] bg-[#0d1117] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-[#e6edf3] font-semibold text-sm hover:text-white transition-colors">
          Lead Qualifier
        </Link>
        <Link
          href="/history"
          className="text-[#8b949e] text-sm hover:text-[#e6edf3] transition-colors"
        >
          History
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[#484f58] text-xs hidden sm:block">{email}</span>
        <button
          onClick={handleSignOut}
          className="text-xs text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] hover:border-[#484f58] px-3 py-1.5 rounded-lg transition-all"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
