export type LeadInput = {
  companyName: string;
  website?: string;
  contactName: string;
  contactEmail: string;
  jobTitle?: string;
  companySize?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  industry?: string;
  useCase?: string;
  notes?: string;
};

export type QualificationResult = {
  score: number;
  tier: "hot" | "warm" | "cold" | "disqualified";
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendedAction: string;
};
