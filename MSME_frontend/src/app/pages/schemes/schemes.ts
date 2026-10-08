import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchemeService, SchemePayload } from '../../services/scheme';
import { Auth } from '../../services/auth';
import { SchemeCard } from '../../shared/scheme-card/scheme-card';
import { FilterPanel, SchemeFilters } from '../../shared/filter-panel/filter-panel';
import { Scheme } from '../../models/scheme';

@Component({
  selector: 'app-schemes',
  standalone: true,
  imports: [CommonModule, FormsModule, SchemeCard, FilterPanel],
  templateUrl: './schemes.html',
  styleUrl: './schemes.css',
})
export class Schemes implements OnInit {
  allSchemes: Scheme[] = [];
  filtered: Scheme[] = [];
  isLoading = true;
  loadError = '';
  actionError = '';
  successMessage = '';

  isAdmin = false;
  editingId: string | null = null;
  isSaving = false;

  form: SchemePayload = this.emptyForm();

  constructor(
    private schemeService: SchemeService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.currentUser()?.role === 'admin';
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.isLoading = true;
    this.loadError = '';

    this.schemeService.getAll().subscribe({
      next: (schemes) => {
        this.allSchemes = schemes;
        this.filtered = schemes;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load schemes:', err);
        this.isLoading = false;
        this.loadError = err?.error?.message || 'Could not connect to the backend. Start MongoDB and the Node.js server, then try again.';
      },
    });
  }

  onFiltersChanged(filters: SchemeFilters): void {
    this.filtered = this.allSchemes.filter(s => {
      const matchesAuthority = !filters.authority || s.authority === filters.authority;
      const matchesCategory = !filters.category || s.category === filters.category;
      const matchesSearch = !filters.search || s.name.toLowerCase().includes(filters.search.toLowerCase());
      return matchesAuthority && matchesCategory && matchesSearch;
    });
  }

  startCreate(): void {
    this.editingId = null;
    this.actionError = '';
    this.successMessage = '';
    this.form = this.emptyForm();
  }

  startEdit(scheme: Scheme): void {
    this.editingId = scheme.id;
    this.actionError = '';
    this.successMessage = '';
    this.form = {
      schemeId: scheme.schemeId,
      name: scheme.name,
      authority: scheme.authority,
      category: scheme.category,
      description: scheme.description,
      subsidyText: scheme.subsidyText,
      minAge: scheme.minAge,
      maxAge: scheme.maxAge,
      minInvestment: scheme.minInvestment,
      maxInvestment: scheme.maxInvestment,
      businessTypes: [...scheme.businessTypes],
      isActive: true,
    };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.actionError = '';
  }

  saveScheme(): void {
    this.actionError = '';
    this.successMessage = '';

    if (!this.form.schemeId || !this.form.name || !this.form.authority ||
        !this.form.category || !this.form.description || !this.form.subsidyText ||
        this.form.businessTypes.length === 0) {
      this.actionError = 'Please fill all required fields and select at least one business type.';
      return;
    }

    this.isSaving = true;
    const request$ = this.editingId
      ? this.schemeService.update(this.editingId, this.form)
      : this.schemeService.create(this.form);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = this.editingId ? 'Scheme updated successfully.' : 'Scheme created successfully.';
        this.editingId = null;
        this.form = this.emptyForm();
        this.loadSchemes();
      },
      error: (err) => {
        this.isSaving = false;
        this.actionError = err?.error?.message || 'Unable to save the scheme.';
      },
    });
  }

  deleteScheme(scheme: Scheme): void {
    if (!confirm(`Delete "${scheme.name}"?`)) return;

    this.actionError = '';
    this.successMessage = '';

    this.schemeService.delete(scheme.id).subscribe({
      next: () => {
        this.successMessage = 'Scheme deleted successfully.';
        this.loadSchemes();
      },
      error: (err) => {
        this.actionError = err?.error?.message || 'Unable to delete the scheme.';
      },
    });
  }

  private emptyForm(): SchemePayload {
    return {
      schemeId: '',
      name: '',
      authority: 'Central',
      category: '',
      description: '',
      subsidyText: '',
      businessTypes: ['Manufacturing'],
      isActive: true,
    };
  }
}
