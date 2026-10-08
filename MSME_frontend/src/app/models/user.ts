export interface User {
  id: string; // mapped from backend's _id
  name: string;
  email: string;
  phone: string;
  role?: 'user' | 'admin';
  businessName?: string;
  businessType?: 'Manufacturing' | 'Service' | 'Trading';
  sector?: string;
  state?: string;
  district?: string;
  businessAge?: 'New' | '<3 years' | '3-10 years' | '10+ years';
  category?: 'General' | 'Women-owned' | 'SC/ST' | 'Differently-abled' | 'Transgender';
}
