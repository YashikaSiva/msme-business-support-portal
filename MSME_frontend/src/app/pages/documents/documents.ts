import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { ApplicationService } from '../../services/application';
import { DocumentService } from '../../services/document';
import { Application } from '../../models/application';
import { AppDocument, DocumentType, REQUIRED_DOCS, computeReadiness } from '../../models/document';

const ALL_TYPES: DocumentType[] = [...REQUIRED_DOCS, 'Caste Certificate', 'Other'];

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class Documents implements OnInit {
  applications: Application[] = [];
  documents: AppDocument[] = [];
  selectedAppId = '';
  isLoading = true;
  isSaving = false;
  error = '';

  requiredDocs = REQUIRED_DOCS;
  allTypes = ALL_TYPES;
  pendingType: DocumentType = 'Other';
  allowedExt = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
  maxBytes = 5 * 1024 * 1024;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private auth: Auth,
    private router: Router,
    private appService: ApplicationService,
    private docService: DocumentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.auth.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }
    this.appService.getMine().subscribe({
      next: (apps) => {
        this.applications = apps;
        this.isLoading = false;
        if (apps.length) {
          this.selectedAppId = apps[0].id;
          this.loadDocuments();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message || 'Could not load your applications.';
        this.cdr.detectChanges();
      },
    });
  }

  loadDocuments(): void {
    this.error = '';
    if (!this.selectedAppId) { this.documents = []; return; }
    this.docService.getForApplication(this.selectedAppId).subscribe({
      next: (docs) => { this.documents = docs; this.cdr.detectChanges(); },
      error: (err) => { this.error = err?.error?.message || 'Could not load documents.'; this.cdr.detectChanges(); },
    });
  }

  docFor(type: DocumentType): AppDocument | undefined {
    return this.documents.find((d) => d.documentType === type && d.status !== 'rejected');
  }

  get extraDocs(): AppDocument[] {
    return this.documents.filter((d) => !this.requiredDocs.includes(d.documentType));
  }

  get readinessPercent(): number {
    return computeReadiness(this.documents);
  }

  // Clicking "Add" remembers which document type is wanted and opens the computer's file picker.
  chooseFile(type: DocumentType): void {
    this.error = '';
    if (!this.selectedAppId) { this.error = 'Select an application first.'; return; }
    this.pendingType = type;
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!this.allowedExt.includes(ext)) {
      this.error = `Only ${this.allowedExt.join(', ')} files are allowed.`;
      return;
    }
    if (file.size > this.maxBytes) {
      this.error = 'File is too large. Maximum size is 5 MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.isSaving = true;
      this.cdr.detectChanges();
      this.docService.upload({
        applicationId: this.selectedAppId,
        documentType: this.pendingType,
        fileName: file.name,
        fileData: reader.result as string,
      }).subscribe({
        next: () => { this.isSaving = false; this.cdr.detectChanges(); this.loadDocuments(); },
        error: (err) => {
          this.isSaving = false;
          this.error = err?.error?.errors?.[0]?.msg || err?.error?.message || 'Upload failed.';
          this.cdr.detectChanges();
        },
      });
    };
    reader.onerror = () => { this.error = 'Could not read the selected file.'; this.cdr.detectChanges(); };
    reader.readAsDataURL(file);
  }

  removeDocument(doc: AppDocument): void {
    if (!confirm(`Remove "${doc.fileName}"?`)) return;
    this.docService.remove(doc.id).subscribe({
      next: () => this.loadDocuments(),
      error: (err) => { this.error = err?.error?.message || 'Could not remove the document.'; this.cdr.detectChanges(); },
    });
  }
}
