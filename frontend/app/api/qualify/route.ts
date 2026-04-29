import { NextRequest, NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase-server";
import type { LeadInput, QualificationResult } from "@/lib/types";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body: LeadInput = await req.json();

  if (!body.companyName || !body.contactName || !body.contactEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  ) as LeadInput;

  const handle = await tasks.trigger("qualify-lead", payload);
  const run = await runs.poll(handle, { pollIntervalMs: 2000 });

  if (run.status !== "COMPLETED") {
    return NextResponse.json(
      { error: `Task ended with status: ${run.status}` },
      { status: 500 }
    );
  }

  const result = run.output as QualificationResult;

  // Save to Supabase (non-blocking — don't fail if save fails)
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("leads").insert({
        user_id: user.id,
        company_name: payload.companyName,
        contact_name: payload.contactName,
        contact_email: payload.contactEmail,
        website: payload.website ?? null,
        job_title: payload.jobTitle ?? null,
        company_size: payload.companySize ?? null,
        industry: payload.industry ?? null,
        use_case: payload.useCase ?? null,
        notes: payload.notes ?? null,
        score: result.score,
        tier: result.tier,
        summary: result.summary,
        strengths: result.strengths,
        concerns: result.concerns,
        recommended_action: result.recommendedAction,
      });
    }
  } catch {
    // Silently ignore — result is still returned
  }

  return NextResponse.json(result);
}
