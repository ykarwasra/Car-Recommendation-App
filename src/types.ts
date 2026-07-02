export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  price: number;
  fuelType: string;
  fuelEconomy: string;
  seats: number;
  cargoCapacity: string;
  engine: string;
  drivetrain: string;
  keyFeatures: string[];
  safetyRating: string;
  description: string;
}

export interface QuizAnswers {
  primaryUse: string;
  budgetRange: string;
  fuelType: string;
  category: string;
  priority: string;
  additionalNotes: string;
}

export interface Recommendation {
  carId: string;
  matchScore: number;
  reasons: string[];
  fitSummary: string;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  generalAdvice: string;
  isFallback: boolean;
}
