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

export type UsageStatus = {
  isPro: boolean;
  usageToday: number;
  limit: number;
};

// Row shape returned from Supabase (snake_case columns)
export type SavedLead = {
  id: string;
  user_id: string;
  created_at: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  website: string | null;
  job_title: string | null;
  company_size: string | null;
  industry: string | null;
  use_case: string | null;
  notes: string | null;
  score: number;
  tier: "hot" | "warm" | "cold" | "disqualified";
  summary: string;
  strengths: string[];
  concerns: string[];
  recommended_action: string;
};
