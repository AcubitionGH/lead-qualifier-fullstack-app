import LeadForm from "./components/LeadForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d1117] py-12 px-4">
      <div className="max-w-2xl mx-auto mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-[#1c2333] border border-[#30363d] rounded-full px-4 py-1.5 text-xs text-[#58a6ff] font-medium mb-6 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse" />
          AI Powered
        </div>
        <h1 className="text-4xl font-bold text-[#e6edf3] tracking-tight">Lead Qualifier</h1>
        <p className="mt-3 text-[#8b949e] text-base">Fill in the lead details and get an instant AI-powered qualification score.</p>
      </div>
      <LeadForm />
    </main>
  );
}
