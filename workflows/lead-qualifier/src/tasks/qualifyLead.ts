import { task } from "@trigger.dev/sdk/v3";
import Anthropic from "@anthropic-ai/sdk";
import { LeadInputSchema, QualificationResultSchema, type LeadInput, type QualificationResult } from "../types";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert B2B sales qualification analyst. Your job is to evaluate an inbound lead and determine how well they fit as a potential customer.

## Scoring Criteria

Evaluate the lead across these dimensions and produce a final score from 0 to 100:

### Budget & Company Size (0–25 pts)
- 500+ employees: 25 pts
- 201–500 employees: 20 pts
- 51–200 employees: 15 pts
- 11–50 employees: 8 pts
- 1–10 employees: 3 pts

### Authority (0–20 pts)
Does the contact's job title suggest decision-making power?
- C-level / VP / Founder: 20 pts
- Director / Head of: 15 pts
- Manager / Lead: 10 pts
- Individual contributor: 3 pts
- Unknown: 5 pts

### Need (0–25 pts)
How clearly does the use case indicate a genuine, urgent need?
- Very specific and urgent: 20–25 pts
- Clear need, not urgent: 12–19 pts
- Vague or exploratory: 5–11 pts
- No use case provided: 0–4 pts

### Industry Fit (0–15 pts)
Reward industries with strong SaaS adoption and B2B buying patterns (e.g. tech, finance, healthcare, professional services). Penalize low-fit industries (e.g. personal services, retail).

### Website / Legitimacy (0–15 pts)
Does the company appear established? (Has a website, professional email domain, recognizable name.)
- Strong signals: 12–15 pts
- Some signals: 6–11 pts
- No signals / suspicious: 0–5 pts

## Tiers

| Score | Tier |
|---|---|
| 75–100 | hot |
| 50–74 | warm |
| 25–49 | cold |
| 0–24 | disqualified |

## Output Format

Return ONLY a valid JSON object with this exact shape — no prose, no markdown fences:

{
  "score": <number 0-100>,
  "tier": "<hot|warm|cold|disqualified>",
  "summary": "<2-3 sentence plain-English summary of the qualification decision>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "recommendedAction": "<one concrete next step for the sales team>"
}`;

function buildUserMessage(lead: LeadInput): string {
  return `Please qualify the following lead:

Company: ${lead.companyName}
Website: ${lead.website ?? "Not provided"}
Contact: ${lead.contactName} (${lead.jobTitle ?? "Title unknown"})
Email: ${lead.contactEmail}
Company Size: ${lead.companySize ?? "Unknown"}
Industry: ${lead.industry ?? "Unknown"}
Use Case: ${lead.useCase ?? "Not provided"}
Additional Notes: ${lead.notes ?? "None"}`;
}

export const qualifyLead = task({
  id: "qualify-lead",
  maxDuration: 60,
  run: async (payload: LeadInput): Promise<QualificationResult> => {
    const lead = payload;

    const userMessage = buildUserMessage(lead);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const rawText = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("");

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error(`AI returned invalid JSON: ${rawText}`);
    }

    // Validate and return typed result
    return QualificationResultSchema.parse(parsed);
  },
});
