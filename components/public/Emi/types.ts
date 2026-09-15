export type EmiProcedure = {
  procedureId: string;
  name: string;
  description: string | null;
  similarity: number;

  categories: {
    id: string;
    name: string;
  }[];

  subcategories: {
    id: string;
    name: string;
  }[];
};

export type EmiProcedureInsight = {
  procedureId: string;
  description: string;
};

export type EmiMatchedProcedure = {
  procedureId: string;
  name: string;
  similarity: number;
  topRank: number | null;
  price: number | string | null;
};

export type EmiDoctor = {
  doctorProfileId: string;
  userId: string;

  slug: string | null;

  name: string | null;
  avatar: string | null;

  clinicName: string | null;

  city: string | null;
  country: string | null;

  yearsOfExperience: number | null;

  onlineActive: boolean;

  currency: string;

  inClinicPrice:
    | number
    | string
    | null;

  onlineConsulPrice:
    | number
    | string
    | null;

  googleRating: number | null;
  googleReviewCount: number | null;

  emRating: number | null;
  emReviewCount: number;

  matchedProcedureCount: number;

  matchedProcedures:
    EmiMatchedProcedure[];

  score: number;
};

export type EmiRecommendResponse = {
  success: boolean;

  query: string;
  locale: string;

  answer: string | null;

  procedureInsights:
    EmiProcedureInsight[];

  warning?: string;

  procedures: EmiProcedure[];
  doctors: EmiDoctor[];

  retrieval?: {
    procedureCount: number;
    doctorCount: number;
    doctorCandidateCount: number;
  };

  error?: string;
};

export type EmiConversationTurn = {
  id: string;
  query: string;

  status:
    | "loading"
    | "complete"
    | "error";

  response:
    | EmiRecommendResponse
    | null;

  error: string | null;
};