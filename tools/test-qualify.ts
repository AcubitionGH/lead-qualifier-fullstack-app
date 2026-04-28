/**
 * Local test script — runs while `trigger dev` is active in workflows/lead-qualifier/
 * Usage: npx tsx tools/test-qualify.ts
 */
import { tasks } from "@trigger.dev/sdk/v3";
import type { qualifyLead } from "../workflows/lead-qualifier/src/tasks/qualifyLead";

async function main() {
  const result = await tasks.triggerAndWait<typeof qualifyLead>("qualify-lead", {
    companyName: "Acme Corp",
    website: "https://acme.com",
    contactName: "Jane Smith",
    contactEmail: "jane@acme.com",
    jobTitle: "VP of Operations",
    companySize: "51-200",
    industry: "SaaS / Technology",
    useCase: "We want to automate our lead scoring process and reduce manual SDR work.",
    notes: "They came in via the website demo request form.",
  });

  if (result.ok) {
    console.log("\n✅ Qualification Result:");
    console.log(JSON.stringify(result.output, null, 2));
  } else {
    console.error("\n❌ Task failed:", result.error);
  }
}

main().catch(console.error);
