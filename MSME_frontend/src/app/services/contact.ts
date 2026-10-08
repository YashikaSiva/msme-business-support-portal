import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactResult {
  success: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/contact`;

  // POST /api/contact  -> saved in MongoDB (ContactMessage collection)
  send(payload: ContactPayload): Observable<ContactResult> {
    return this.http.post<{ success: boolean }>(this.apiUrl, payload).pipe(
      map(() => ({ success: true })),
      catchError((err: HttpErrorResponse) => {
        const errors = err.error?.errors as { message: string }[] | undefined;
        const message =
          errors?.length ? errors.map((e) => e.message).join(' ')
          : err.error?.message ?? 'Could not send your message. Please try again.';
        return of({ success: false, message });
      })
    );
  }
}
