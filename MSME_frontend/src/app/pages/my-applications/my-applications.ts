import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { ApplicationService } from '../../services/application';
import { SchemeService } from '../../services/scheme';
import { Application } from '../../models/application';
import { Scheme } from '../../models/scheme';

type FilterTab = 'All' | 'Preparing' | 'Submitted' | 'Decided';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './my-applications.html',
  styleUrl: './my-applications.css',
})
export class MyApplications implements OnInit {
  applications: Application[] = [];
  allSchemes: Scheme[] = [];
  activeTab: FilterTab = 'All';
  trackerForm: FormGroup;
  duplicateError = '';
  isLoading = true;

  stageOptions: Application['stage'][] = [
    'Preparing', 'Submitted', 'Waiting for Decision', 'Approved', 'Rejected', 'Needs More Info'
  ];

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private applicationService: ApplicationService,
    private schemeService: SchemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.trackerForm = this.fb.group({
      schemeId: ['', Validators.required],
    });
  }

  get schemeId() { return this.trackerForm.get('schemeId')!; }

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.schemeService.getAll().subscribe((schemes) => {
      this.allSchemes = schemes;
      this.cdr.detectChanges();
    });
    this.refresh();
  }

  refresh(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.isLoading = true;
    this.applicationService.getMine().subscribe({
      next: (applications) => {
        this.applications = applications;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filteredApplications(): Application[] {
    if (this.activeTab === 'All') return this.applications;
    if (this.activeTab === 'Decided') {
      return this.applications.filter(a => ['Approved', 'Rejected'].includes(a.stage));
    }
    return this.applications.filter(a => a.stage === this.activeTab);
  }

  startTracking(): void {
    this.duplicateError = '';

    if (this.trackerForm.invalid) {
      this.trackerForm.markAllAsTouched();
      return;
    }

    const user = this.auth.currentUser();
    const selectedId = this.schemeId.value; // this is the scheme's Mongo _id
    if (!user) return;

    const alreadyTracked = this.applications.some(a => a.schemeId === selectedId);
    if (alreadyTracked) {
      this.duplicateError = "You're already tracking this scheme.";
      return;
    }

    this.applicationService.add(selectedId).subscribe({
      next: () => {
        this.trackerForm.reset({ schemeId: '' });
        this.refresh();
      },
      error: (err) => {
        this.duplicateError = err?.error?.message ?? 'Could not start tracking this scheme.';
        this.cdr.detectChanges();
      },
    });
  }

  updateStage(app: Application, newStage: Application['stage']): void {
    this.applicationService.updateStage(app.id, newStage, app.note).subscribe(() => this.refresh());
  }

  updateNote(app: Application, note: string): void {
    if (note.length > 200) return;
    this.applicationService.updateStage(app.id, app.stage, note).subscribe();
  }

  stepIndex(stage: Application['stage']): number {
    const order: Application['stage'][] = ['Preparing', 'Submitted', 'Waiting for Decision', 'Approved'];
    return order.indexOf(stage);
  }
}
