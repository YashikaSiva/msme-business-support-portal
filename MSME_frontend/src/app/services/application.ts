import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Application } from '../models/application';
import { environment } from '../../environments/environment';

interface BackendApplication {
  _id: string;
  userEmail: string;
  scheme: { _id: string; name: string } | string;
  schemeId: string;
  schemeName: string;
  stage: Application['stage'];
  note?: string;
  updatedAt: string;
}

function toApplication(a: BackendApplication): Application {
  return {
    id: a._id,
    userEmail: a.userEmail,
    schemeId: typeof a.scheme === 'string' ? a.scheme : a.scheme._id,
    schemeName: a.schemeName,
    stage: a.stage,
    note: a.note,
    updatedAt: a.updatedAt,
  };
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/applications`;

  // Returns the logged-in user's own applications (backend infers the user from the JWT).
  getMine(): Observable<Application[]> {
    return this.http
      .get<{ success: boolean; data: BackendApplication[] }>(this.apiUrl)
      .pipe(map((res) => res.data.map(toApplication)));
  }

  // schemeId here must be the scheme's Mongo _id (Scheme.id in the frontend model).
  add(schemeId: string, note?: string): Observable<Application> {
    return this.http
      .post<{ success: boolean; data: BackendApplication }>(this.apiUrl, { schemeId, note })
      .pipe(map((res) => toApplication(res.data)));
  }

  updateStage(id: string, stage: Application['stage'], note?: string): Observable<Application> {
    return this.http
      .put<{ success: boolean; data: BackendApplication }>(`${this.apiUrl}/${id}/stage`, { stage, note })
      .pipe(map((res) => toApplication(res.data)));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
