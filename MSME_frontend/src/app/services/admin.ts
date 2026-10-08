import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Scheme } from '../models/scheme';
import { SchemePayload, SchemeService } from './scheme';

export type Stage = 'Preparing' | 'Submitted' | 'Waiting for Decision' | 'Approved' | 'Rejected' | 'Needs More Info';
export type MessageStatus = 'new' | 'in-progress' | 'resolved';

export const STAGES: Stage[] = [
  'Preparing', 'Submitted', 'Waiting for Decision', 'Approved', 'Rejected', 'Needs More Info',
];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isActive: boolean;
  businessName?: string;
  businessType?: string;
  district?: string;
  createdAt: string;
}

export interface AdminScheme extends Scheme {
  isActive: boolean;
}

export interface AdminApplication {
  id: string;
  userName: string;
  userEmail: string;
  businessName?: string;
  schemeName: string;
  stage: Stage;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMsg {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

export interface AdminStats {
  users: { total: number; active: number; admins: number };
  schemes: { total: number; active: number };
  applications: { total: number; byStage: Record<string, number> };
  messages: { total: number; newCount: number };
  recentApplications: AdminApplication[];
  recentUsers: AdminUser[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = any;

const toUser = (u: Raw): AdminUser => ({ ...u, id: u._id });
const toScheme = (s: Raw): AdminScheme => ({ ...s, id: s._id, isActive: s.isActive !== false });
const toApplication = (a: Raw): AdminApplication => ({
  id: a._id,
  userName: a.user?.name ?? '(deleted user)',
  userEmail: a.userEmail,
  businessName: a.user?.businessName ?? a.applicantDetails?.businessName,
  schemeName: a.schemeName,
  stage: a.stage,
  note: a.note,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});
const toMsg = (m: Raw): ContactMsg => ({ ...m, id: m._id });

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private schemeService = inject(SchemeService);
  private api = environment.apiUrl;

  stats(): Observable<AdminStats> {
    return this.http.get<{ data: Raw }>(`${this.api}/admin/stats`).pipe(
      map(({ data }) => ({
        ...data,
        messages: { total: data.messages.total, newCount: data.messages.new },
        recentApplications: data.recentApplications.map(toApplication),
        recentUsers: data.recentUsers.map(toUser),
      }))
    );
  }

  // ---- users ----
  users(search = '', role = ''): Observable<AdminUser[]> {
    let params = new HttpParams().set('limit', '100');
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    return this.http
      .get<{ data: Raw[] }>(`${this.api}/admin/users`, { params })
      .pipe(map((r) => r.data.map(toUser)));
  }

  updateUserAccess(id: string, changes: { role?: 'user' | 'admin'; isActive?: boolean }): Observable<AdminUser> {
    return this.http
      .put<{ data: Raw }>(`${this.api}/admin/users/${id}/access`, changes)
      .pipe(map((r) => toUser(r.data)));
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete(`${this.api}/admin/users/${id}`).pipe(map(() => void 0));
  }

  // ---- applications ----
  applications(stage = '', search = ''): Observable<AdminApplication[]> {
    let params = new HttpParams();
    if (stage) params = params.set('stage', stage);
    if (search) params = params.set('search', search);
    return this.http
      .get<{ data: Raw[] }>(`${this.api}/admin/applications`, { params })
      .pipe(map((r) => r.data.map(toApplication)));
  }

  // Reuses the existing endpoint — it also notifies the applicant.
  updateStage(id: string, stage: Stage, note?: string): Observable<void> {
    return this.http
      .put(`${this.api}/applications/${id}/stage`, { stage, note })
      .pipe(map(() => void 0));
  }

  // ---- schemes (reuses the existing admin-only scheme endpoints) ----
  schemes(): Observable<AdminScheme[]> {
    return this.http
      .get<{ data: Raw[] }>(`${this.api}/admin/schemes`)
      .pipe(map((r) => r.data.map(toScheme)));
  }

  createScheme(payload: SchemePayload): Observable<Scheme> {
    return this.schemeService.create(payload);
  }

  updateScheme(id: string, payload: Partial<SchemePayload>): Observable<Scheme> {
    return this.schemeService.update(id, payload);
  }

  deleteScheme(id: string): Observable<void> {
    return this.schemeService.delete(id);
  }

  // ---- contact messages ----
  messages(status = ''): Observable<ContactMsg[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http
      .get<{ data: Raw[] }>(`${this.api}/contact`, { params })
      .pipe(map((r) => r.data.map(toMsg)));
  }

  updateMessageStatus(id: string, status: MessageStatus): Observable<ContactMsg> {
    return this.http
      .put<{ data: Raw }>(`${this.api}/contact/${id}/status`, { status })
      .pipe(map((r) => toMsg(r.data)));
  }

  deleteMessage(id: string): Observable<void> {
    return this.http.delete(`${this.api}/contact/${id}`).pipe(map(() => void 0));
  }
}
