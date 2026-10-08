import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Notification } from '../models/notification';
import { environment } from '../../environments/environment';

interface BackendNotification {
  _id: string;
  message: string;
  type: Notification['type'];
  read: boolean;
  createdAt: string;
}

function toNotification(n: BackendNotification): Notification {
  return { id: n._id, message: n.message, type: n.type, read: n.read, createdAt: n.createdAt };
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  private lastUnreadCount = 0;

  getAll(): Observable<Notification[]> {
    return this.http
      .get<{ success: boolean; unreadCount: number; data: BackendNotification[] }>(this.apiUrl)
      .pipe(
        tap((res) => (this.lastUnreadCount = res.unreadCount)),
        map((res) => res.data.map(toNotification))
      );
  }

  // Reflects the unread count from the most recent getAll() call.
  // Call getAll() first (e.g. on page load) before relying on this.
  unreadCount(): number {
    return this.lastUnreadCount;
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http
      .put<{ success: boolean; data: BackendNotification }>(`${this.apiUrl}/${id}/read`, {})
      .pipe(map((res) => toNotification(res.data)));
  }

  markAllRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/mark-all-read`, {}).pipe(tap(() => (this.lastUnreadCount = 0)));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
