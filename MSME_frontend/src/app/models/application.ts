export interface Application {
  id: string; // mapped from backend's _id
  userEmail: string;
  schemeId: string; // scheme's Mongo _id (used to POST /applications)
  schemeName: string;
  stage: 'Preparing' | 'Submitted' | 'Waiting for Decision' | 'Approved' | 'Rejected' | 'Needs More Info';
  note?: string;
  updatedAt: string;
}
