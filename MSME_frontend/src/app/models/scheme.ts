export interface Scheme {
  id: string; // mapped from backend's _id (used in routes: /schemes/:id)
  schemeId: string; // human-readable slug from backend, e.g. "pmegp"
  name: string;
  authority: 'Central' | 'Tamil Nadu';
  category: string;
  description: string;
  subsidyText: string;
  minAge?: number;
  maxAge?: number;
  minInvestment?: number;
  maxInvestment?: number;
  businessTypes: string[];
}
