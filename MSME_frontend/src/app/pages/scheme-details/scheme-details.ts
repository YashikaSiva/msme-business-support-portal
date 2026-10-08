import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SchemeService } from '../../services/scheme';
import { Scheme } from '../../models/scheme';

@Component({
  selector: 'app-scheme-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './scheme-details.html',
  styleUrl: './scheme-details.css',
})
export class SchemeDetails implements OnInit {
  scheme: Scheme | undefined;
  isLoading = true;
  loadError: string | null = null;

  constructor(private route: ActivatedRoute, private schemeService: SchemeService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => this.load(params.get('id')));
  }

  private load(id: string | null): void {
    this.isLoading = true;
    this.loadError = null;
    this.scheme = undefined;

    if (!id) {
      this.isLoading = false;
      this.loadError = 'No scheme ID was provided.';
      return;
    }

    this.schemeService.getById(id).subscribe({
      next: (scheme) => {
        this.scheme = scheme;
        this.isLoading = false;
        if (!scheme) {
          this.loadError = 'Scheme not found.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load scheme', err);
        this.loadError = err?.error?.message || 'Could not load this scheme.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
