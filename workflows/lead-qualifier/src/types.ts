import { z } from "zod";

export const LeadInputSchema = z.object({
  companyName: z.string().min(1),
  website: z.string().url().or(z.literal("")).optional(),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  jobTitle: z.string().optional(),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
  industry: z.string().optional(),
  useCase: z.string().optional(),
  notes: z.string().optional(),
});

export type LeadInput = z.infer<typeof LeadInputSchema>;

export const QualificationResultSchema = z.object({
  score: z.number().min(0).max(100),
  tier: z.enum(["hot", "warm", "cold", "disqualified"]),
  summary: z.string(),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  recommendedAction: z.string(),
});

export type QualificationResult = z.infer<typeof QualificationResultSchema>;
