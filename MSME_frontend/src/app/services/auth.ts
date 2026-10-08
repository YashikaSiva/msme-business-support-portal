import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'msme_token';
const SESSION_KEY = 'msme_session';

export interface AuthResult {
  success: boolean;
  message?: string;
}

interface BackendUser {
  _id: string;
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

interface AuthResponse {
  success: boolean;
  token: string;
  data: BackendUser;
  message?: string;
}

function toUser(u: BackendUser): User {
  const { _id, ...rest } = u;
  return {
    id: _id,
    ...rest
  };
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(
    this.isBrowser ? this.loadSession() : null
  );

  private loadSession(): User | null {
    if (!this.isBrowser) {
      return null;
    }

    const raw = localStorage.getItem(SESSION_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  }

  private setSession(token: string, user: User): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  register(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    businessName?: string;
    businessType?: string;
    sector?: string;
    state?: string;
    district?: string;
    businessAge?: string;
    category?: string;
  }): Observable<AuthResult> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(
        tap((res) => {
          this.setSession(res.token, toUser(res.data));
        }),
        map(() => ({
          success: true
        })),
        catchError((err) =>
          of({
            success: false,
            message: err?.error?.message ?? 'Registration failed.'
          })
        )
      );
  }

  login(email: string, password: string): Observable<AuthResult> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, {
        email,
        password
      })
      .pipe(
        tap((res) => {
          this.setSession(res.token, toUser(res.data));
        }),
        map(() => ({
          success: true
        })),
        catchError((err) =>
          of({
            success: false,
            message: err?.error?.message ?? 'Incorrect email or password.'
          })
        )
      );
  }

  refreshMe(): Observable<User | null> {
    return this.http
      .get<{
        success: boolean;
        data: BackendUser;
      }>(`${this.apiUrl}/me`)
      .pipe(
        tap((res) => {
          const user = toUser(res.data);

          if (this.isBrowser) {
            localStorage.setItem(
              SESSION_KEY,
              JSON.stringify(user)
            );
          }

          this.currentUser.set(user);
        }),
        map((res) => toUser(res.data)),
        catchError(() => of(null))
      );
  }

  updateProfile(
    id: string,
    payload: Partial<Omit<User, 'id' | 'email' | 'role'>>
  ): Observable<AuthResult> {
    return this.http
      .put<{ success: boolean; data: BackendUser }>(`${environment.apiUrl}/users/${id}`, payload)
      .pipe(
        tap((res) => {
          const user = toUser(res.data);
          if (this.isBrowser) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
          }
          this.currentUser.set(user);
        }),
        map(() => ({ success: true })),
        catchError((err) =>
          of({
            success: false,
            message: err?.error?.errors?.[0]?.msg ?? err?.error?.message ?? 'Could not update profile.'
          })
        )
      );
  }

  logout(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    this.currentUser.set(null);
  }
}