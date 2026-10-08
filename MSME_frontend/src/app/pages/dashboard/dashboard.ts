import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Auth } from '../../services/auth';
import { SchemeService, SchemeMatch } from '../../services/scheme';
import { ApplicationService } from '../../services/application';
import { NotificationService } from '../../services/notification';
import { DocumentService } from '../../services/document';
import { User } from '../../models/user';
import { Application } from '../../models/application';
import { Notification } from '../../models/notification';
import { computeReadiness } from '../../models/document';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  user: User | null = null;
  matches: SchemeMatch[] = [];
  applications: Application[] = [];
  notifications: Notification[] = [];
  // Same calculation as the Document Checklist page, for the selected application.
  readinessPercent = 0;
  readinessAppId = '';
  isLoading = true;

  constructor(
    private auth: Auth,
    private router: Router,
    private schemeService: SchemeService,
    private applicationService: ApplicationService,
    private notificationService: NotificationService,
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser();

    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    forkJoin({
      matches: this.schemeService.getMatches(this.user),
      applications: this.applicationService.getMine(),
      notifications: this.notificationService.getAll(),
    }).subscribe({
      next: ({ matches, applications, notifications }) => {
        this.matches = matches.slice(0, 4);
        this.applications = applications;
        this.notifications = notifications.slice(0, 3);
        this.isLoading = false;
        // Default to the first application, exactly like the checklist page.
        if (applications.length) {
          this.readinessAppId = applications[0].id;
          this.loadReadiness();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadReadiness(): void {
    if (!this.readinessAppId) {
      this.readinessPercent = 0;
      return;
    }
    this.documentService.getForApplication(this.readinessAppId).subscribe({
      next: (docs) => {
        this.readinessPercent = computeReadiness(docs);
        this.cdr.detectChanges();
      },
      error: () => {
        this.readinessPercent = 0;
        this.cdr.detectChanges();
      },
    });
  }

  onReadinessAppChange(id: string): void {
    this.readinessAppId = id;
    this.loadReadiness();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
