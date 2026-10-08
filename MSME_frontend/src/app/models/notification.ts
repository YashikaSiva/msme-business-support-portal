export interface Notification {
  id: string; // mapped from backend's _id
  message: string;
  type: 'match' | 'reminder' | 'status' | 'general';
  createdAt: string;
  read: boolean;
}
