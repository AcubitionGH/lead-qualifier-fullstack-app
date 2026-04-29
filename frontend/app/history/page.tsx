import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import LeadHistoryRow from "./components/LeadHistoryRow";
import type { SavedLead } from "@/lib/types";

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#0d1117] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3]">Lead History</h1>
            <p className="text-[#8b949e] text-sm mt-1">{leads?.length ?? 0} leads qualified</p>
          </div>
          <Link
            href="/"
            className="text-sm bg-[#1d6dd4] hover:bg-[#1f7aec] text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + New Lead
          </Link>
        </div>

        {!leads || leads.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center">
            <p className="text-[#8b949e] text-sm">No leads qualified yet.</p>
            <Link href="/" className="text-[#58a6ff] hover:text-[#79b8ff] text-sm mt-2 inline-block transition-colors">
              Qualify your first lead →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(leads as SavedLead[]).map((lead) => (
              <LeadHistoryRow key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
