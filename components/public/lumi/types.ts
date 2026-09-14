export type LumiProcedure = {
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

export type LumiProcedureInsight = {
  procedureId: string;
  description: string;
};

export type LumiMatchedProcedure = {
  procedureId: string;
  name: string;
  similarity: number;
  topRank: number | null;
  price: number | string | null;
};

export type LumiDoctor = {
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
    LumiMatchedProcedure[];

  score: number;
};

export type LumiRecommendResponse = {
  success: boolean;

  query: string;
  locale: string;

  answer: string | null;

  procedureInsights:
    LumiProcedureInsight[];

  warning?: string;

  procedures: LumiProcedure[];
  doctors: LumiDoctor[];

  retrieval?: {
    procedureCount: number;
    doctorCount: number;
    doctorCandidateCount: number;
  };

  error?: string;
};

export type LumiConversationTurn = {
  id: string;
  query: string;

  status:
    | "loading"
    | "complete"
    | "error";

  response:
    | LumiRecommendResponse
    | null;

  error: string | null;
};