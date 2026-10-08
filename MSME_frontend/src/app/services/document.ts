import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppDocument, DocumentType } from '../models/document';
import { environment } from '../../environments/environment';

interface BackendDocument {
  _id: string;
  application: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  status: AppDocument['status'];
}

function toDoc(d: BackendDocument): AppDocument {
  return {
    id: d._id,
    applicationId: d.application,
    documentType: d.documentType,
    fileName: d.fileName,
    fileUrl: d.fileUrl,
    status: d.status,
  };
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/documents`;

  getForApplication(applicationId: string): Observable<AppDocument[]> {
    return this.http
      .get<{ success: boolean; data: BackendDocument[] }>(`${this.apiUrl}/application/${applicationId}`)
      .pipe(map((res) => res.data.map(toDoc)));
  }

  add(payload: { applicationId: string; documentType: DocumentType; fileName: string; fileUrl: string }): Observable<AppDocument> {
    return this.http
      .post<{ success: boolean; data: BackendDocument }>(this.apiUrl, payload)
      .pipe(map((res) => toDoc(res.data)));
  }

  // Uploads a file chosen from the user's computer (sent as base64; backend stores it).
  upload(payload: { applicationId: string; documentType: DocumentType; fileName: string; fileData: string }): Observable<AppDocument> {
    return this.http
      .post<{ success: boolean; data: BackendDocument }>(`${this.apiUrl}/upload`, payload)
      .pipe(map((res) => toDoc(res.data)));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
