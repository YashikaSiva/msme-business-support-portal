import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SchemeService, CriteriaMatch } from '../../services/scheme';
import { SchemeCard } from '../../shared/scheme-card/scheme-card';

@Component({
  selector: 'app-eligibility-checker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SchemeCard],
  templateUrl: './eligibility-checker.html',
  styleUrl: './eligibility-checker.css',
})
export class EligibilityChecker {
  form: FormGroup;
  submitted = false;
  isChecking = false;
  results: CriteriaMatch[] = [];

  constructor(private fb: FormBuilder, private schemeService: SchemeService) {
    this.form = this.fb.group({
      businessType: ['Manufacturing', Validators.required],
      investment: [null, [Validators.required, Validators.min(1), Validators.max(100000000)]],
      age: [null, [Validators.required, Validators.min(18), Validators.max(100)]],
      isFirstGen: [false],
      isWomenOwned: [false],
    });
  }

  get businessType() { return this.form.get('businessType')!; }
  get investment() { return this.form.get('investment')!; }
  get age() { return this.form.get('age')!; }

  checkEligibility(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;

    this.isChecking = true;
    this.schemeService.matchByCriteria({
      businessType: v.businessType,
      investment: v.investment,
      age: v.age,
      isFirstGen: v.isFirstGen,
      isWomenOwned: v.isWomenOwned,
    }).subscribe((results) => {
      this.results = results;
      this.submitted = true;
      this.isChecking = false;
    });
  }

  get fullMatches() {
    return this.results.filter(r => r.missingCriteria.length === 0);
  }

  get closeMatches() {
    return this.results.filter(r => r.missingCriteria.length === 1);
  }
}
