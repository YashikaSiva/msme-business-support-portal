import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  step = 1;
  errorMessage = '';
  isSubmitting = false;

  accountForm: FormGroup;
  businessForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordsMatch });

    this.businessForm = this.fb.group({
      businessName: ['', Validators.required],
      businessType: ['Manufacturing', Validators.required],
      sector: [''],
      state: ['Tamil Nadu'],
      district: ['', Validators.required],
      businessAge: ['New', Validators.required],
      category: ['General'],
    });
  }

  get name() { return this.accountForm.get('name')!; }
  get email() { return this.accountForm.get('email')!; }
  get phone() { return this.accountForm.get('phone')!; }
  get password() { return this.accountForm.get('password')!; }
  get confirmPassword() { return this.accountForm.get('confirmPassword')!; }
  get businessName() { return this.businessForm.get('businessName')!; }
  get district() { return this.businessForm.get('district')!; }

  goToStep2(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    this.step = 2;
  }

  onSubmit(): void {
    if (this.businessForm.invalid) {
      this.businessForm.markAllAsTouched();
      return;
    }
    const account = this.accountForm.value;
    const business = this.businessForm.value;

    this.isSubmitting = true;
    this.auth.register({
      name: account.name,
      email: account.email,
      phone: account.phone,
      password: account.password,
      confirmPassword: account.confirmPassword,
      businessName: business.businessName,
      businessType: business.businessType,
      sector: business.sector,
      state: business.state,
      district: business.district,
      businessAge: business.businessAge,
      category: business.category,
    }).subscribe((result) => {
      this.isSubmitting = false;
      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = result.message ?? 'Registration failed.';
        this.step = 1;
      }
    });
  }
}
