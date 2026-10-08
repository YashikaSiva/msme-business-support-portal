import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { User } from '../../models/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  user = signal<User | null>(null);
  editing = signal(false);
  saving = signal(false);
  message = signal('');
  error = signal('');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    businessName: ['', Validators.required],
    businessType: ['Manufacturing'],
    sector: [''],
    state: ['Tamil Nadu'],
    district: ['', Validators.required],
    businessAge: ['New'],
    category: ['General'],
  });

  ngOnInit(): void {
    const cached = this.auth.currentUser();
    if (!cached) {
      this.router.navigate(['/login']);
      return;
    }
    // Show what we have straight away, then refresh from the server so the
    // page always reflects the details saved at registration.
    this.user.set(cached);
    this.auth.refreshMe().subscribe((fresh) => {
      if (fresh) this.user.set(fresh);
    });
  }

  startEdit(): void {
    const u = this.user();
    if (!u) return;
    this.form.patchValue({
      name: u.name,
      phone: u.phone,
      businessName: u.businessName ?? '',
      businessType: u.businessType ?? 'Manufacturing',
      sector: u.sector ?? '',
      state: u.state ?? 'Tamil Nadu',
      district: u.district ?? '',
      businessAge: u.businessAge ?? 'New',
      category: u.category ?? 'General',
    });
    this.message.set('');
    this.error.set('');
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.error.set('');
  }

  save(): void {
    const u = this.user();
    if (!u) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.auth.updateProfile(u.id, this.form.getRawValue() as unknown as Partial<User>).subscribe((res) => {
      this.saving.set(false);
      if (res.success) {
        this.user.set(this.auth.currentUser());
        this.editing.set(false);
        this.message.set('Profile updated.');
      } else {
        this.error.set(res.message ?? 'Could not update profile.');
      }
    });
  }
}
