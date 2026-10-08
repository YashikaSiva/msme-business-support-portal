import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SchemeFilters {
  authority: string;
  category: string;
  search: string;
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.css',
})
export class FilterPanel {
  authority = '';
  category = '';
  search = '';

  @Output() filtersChanged = new EventEmitter<SchemeFilters>();

  categories = [
    'Manufacturing', 'Credit/Loan', 'Women Entrepreneurs',
    'First-Generation Entrepreneurs', 'Technology Upgrade', 'Export', 'Agro-based'
  ];

  emit(): void {
    this.filtersChanged.emit({ authority: this.authority, category: this.category, search: this.search });
  }
}