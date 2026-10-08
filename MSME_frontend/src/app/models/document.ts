export type DocumentType =
  | 'Aadhaar Card' | 'PAN Card' | 'Project Report' | 'Business Registration'
  | 'Bank Statement' | 'Caste Certificate' | 'Address Proof' | 'Other';

export interface AppDocument {
  id: string;
  applicationId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  status: 'missing' | 'uploaded' | 'verified' | 'rejected';
}

// Core documents most schemes ask for. The Document Checklist page and the
// Dashboard both compute "Document Readiness" against this same list.
export const REQUIRED_DOCS: DocumentType[] = [
  'Aadhaar Card', 'PAN Card', 'Project Report', 'Business Registration', 'Bank Statement', 'Address Proof',
];

// % of required documents that have a (non-rejected) file for one application.
export function computeReadiness(docs: AppDocument[]): number {
  const done = REQUIRED_DOCS.filter((t) =>
    docs.some((d) => d.documentType === t && d.status !== 'rejected')
  ).length;
  return Math.round((done / REQUIRED_DOCS.length) * 100);
}
