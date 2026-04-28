import { NextRequest, NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { LeadInput, QualificationResult } from "@/lib/types";

// Allow up to 120s for the AI task to complete
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body: LeadInput = await req.json();

  if (!body.companyName || !body.contactName || !body.contactEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Strip empty strings so optional fields don't fail URL/format validation
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

  return NextResponse.json(run.output as QualificationResult);
}
