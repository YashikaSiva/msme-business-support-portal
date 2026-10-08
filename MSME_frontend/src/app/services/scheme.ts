import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { Scheme } from '../models/scheme';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

interface BackendScheme extends Omit<Scheme, 'id'> {
  _id: string;
  isActive?: boolean;
}

export interface SchemePayload {
  schemeId: string;
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
  isActive?: boolean;
}

function toScheme(s: BackendScheme): Scheme {
  const { _id, ...rest } = s;
  return { id: _id, ...rest };
}

@Injectable({ providedIn: 'root' })
export class SchemeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/schemes`;
  private cached$: Observable<Scheme[]> | null = null;

  getAll(): Observable<Scheme[]> {
    if (!this.cached$) {
      this.cached$ = this.http
        .get<{ success: boolean; data: BackendScheme[] }>(this.apiUrl)
        .pipe(
          map((res) => res.data.map(toScheme)),
          shareReplay({ bufferSize: 1, refCount: true })
        );
    }
    return this.cached$;
  }

  private clearCache(): void {
    this.cached$ = null;
  }

  getById(id: string): Observable<Scheme | undefined> {
    return this.http
      .get<{ success: boolean; data: BackendScheme }>(`${this.apiUrl}/${id}`)
      .pipe(
        map((res) => toScheme(res.data)),
        catchError((err) => {
          console.error(`SchemeService.getById(${id}) failed:`, err);
          // Fallback: look the scheme up in the full list (by _id or schemeId slug)
          return this.getAll().pipe(
            map((all) => all.find((s) => s.id === id || s.schemeId === id)),
            catchError(() => of(undefined))
          );
        })
      );
  }

  create(payload: SchemePayload): Observable<Scheme> {
    return this.http
      .post<{ success: boolean; data: BackendScheme }>(this.apiUrl, payload)
      .pipe(
        map((res) => toScheme(res.data)),
        tap(() => this.clearCache())
      );
  }

  update(id: string, payload: Partial<SchemePayload>): Observable<Scheme> {
    return this.http
      .put<{ success: boolean; data: BackendScheme }>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        map((res) => toScheme(res.data)),
        tap(() => this.clearCache())
      );
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<{ success: boolean }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => void 0),
        tap(() => this.clearCache())
      );
  }

  getMatches(user: User | null): Observable<SchemeMatch[]> {
    if (!user) return of([]);
    return this.http
      .get<{ success: boolean; data: { scheme: BackendScheme; matchedCriteria: string[]; totalCriteria: number }[] }>(
        `${this.apiUrl}/match/me`
      )
      .pipe(
        map((res) =>
          res.data.map((m) => ({
            scheme: toScheme(m.scheme),
            matchedCriteria: m.matchedCriteria,
            totalCriteria: m.totalCriteria,
          }))
        )
      );
  }

  matchByCriteria(criteria: {
    businessType: string;
    investment: number;
    age: number;
    isFirstGen: boolean;
    isWomenOwned: boolean;
  }): Observable<CriteriaMatch[]> {
    return this.getAll().pipe(
      map((schemes) =>
        schemes.map((scheme) => {
          const checks: { label: string; passed: boolean }[] = [];

          checks.push({
            label: `Business type: ${criteria.businessType}`,
            passed: scheme.businessTypes.includes(criteria.businessType),
          });

          if (scheme.minInvestment !== undefined && scheme.maxInvestment !== undefined) {
            checks.push({
              label: `Investment ₹${scheme.minInvestment.toLocaleString()}–₹${scheme.maxInvestment.toLocaleString()}`,
              passed: criteria.investment >= scheme.minInvestment && criteria.investment <= scheme.maxInvestment,
            });
          }

          if (scheme.minAge !== undefined) {
            const maxOk = scheme.maxAge ? criteria.age <= scheme.maxAge : true;
            checks.push({
              label: `Age ${scheme.minAge}${scheme.maxAge ? '–' + scheme.maxAge : '+'}`,
              passed: criteria.age >= scheme.minAge && maxOk,
            });
          }

          if (scheme.category === 'First-Generation Entrepreneurs') {
            checks.push({ label: 'First-generation entrepreneur', passed: criteria.isFirstGen });
          }

          if (scheme.category === 'Women Entrepreneurs') {
            checks.push({ label: 'Women-owned business', passed: criteria.isWomenOwned });
          }

          return {
            scheme,
            matchedCriteria: checks.filter((c) => c.passed).map((c) => c.label),
            missingCriteria: checks.filter((c) => !c.passed).map((c) => c.label),
            totalCriteria: checks.length,
          };
        })
      )
    );
  }
}

export interface SchemeMatch {
  scheme: Scheme;
  matchedCriteria: string[];
  totalCriteria: number;
}

export interface CriteriaMatch extends SchemeMatch {
  missingCriteria: string[];
}
