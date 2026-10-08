import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth } from '../../services/auth';
import {
  AdminApplication, AdminScheme, AdminService, AdminStats, AdminUser, ContactMsg,
  MessageStatus, STAGES, Stage,
} from '../../services/admin';
import { SchemePayload } from '../../services/scheme';

type Tab = 'overview' | 'schemes' | 'applications' | 'users' | 'messages';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private admin = inject(AdminService);
  private auth = inject(Auth);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  readonly stages = STAGES;
  readonly businessTypeOptions = ['Manufacturing', 'Service', 'Trading'];
  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'schemes', label: 'Schemes' },
    { id: 'applications', label: 'Applications' },
    { id: 'users', label: 'Users' },
    { id: 'messages', label: 'Messages' },
  ];

  me = this.auth.currentUser;
  tab = signal<Tab>('overview');
  loading = signal(false);
  toast = signal<{ text: string; error: boolean } | null>(null);

  stats = signal<AdminStats | null>(null);
  schemes = signal<AdminScheme[]>([]);
  applications = signal<AdminApplication[]>([]);
  users = signal<AdminUser[]>([]);
  messages = signal<ContactMsg[]>([]);

  // filters
  schemeSearch = signal('');
  appStage = signal('');
  appSearch = signal('');
  userSearch = signal('');
  userRole = signal('');
  msgStatus = signal('');
  expandedMsg = signal<string | null>(null);

  // scheme editor
  editorOpen = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  formError = signal('');

  schemeForm = this.fb.group({
    schemeId: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    authority: ['Central' as 'Central' | 'Tamil Nadu', Validators.required],
    category: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    subsidyText: ['', [Validators.required, Validators.maxLength(300)]],
    minAge: [null as number | null],
    maxAge: [null as number | null],
    minInvestment: [null as number | null],
    maxInvestment: [null as number | null],
    businessTypes: [[] as string[], Validators.required],
    isActive: [true],
  });

  filteredSchemes = computed(() => {
    const q = this.schemeSearch().trim().toLowerCase();
    if (!q) return this.schemes();
    return this.schemes().filter((s) =>
      [s.name, s.schemeId, s.category, s.authority].some((v) => v.toLowerCase().includes(q))
    );
  });

  stageEntries = computed(() => {
    const s = this.stats();
    if (!s) return [];
    const max = Math.max(1, ...Object.values(s.applications.byStage));
    return this.stages.map((st) => {
      const count = s.applications.byStage[st] ?? 0;
      return { stage: st, count, pct: (count / max) * 100 };
    });
  });

  ngOnInit(): void {
    // Re-check the role against the server so a stale local session can't open this page.
    this.auth.refreshMe().subscribe((u) => {
      if (!u || u.role !== 'admin') {
        this.router.navigate([u ? '/dashboard' : '/login']);
        return;
      }
      this.loadTab('overview');
    });
  }

  tabIndex = computed(() => this.tabs.findIndex((t) => t.id === this.tab()));

  setTab(t: Tab): void {
    this.tab.set(t);
    this.loadTab(t);
  }

  loadTab(t: Tab = this.tab()): void {
    this.loading.set(true);
    const done = () => this.loading.set(false);
    const fail = (e: HttpErrorResponse) => { done(); this.notify(this.errText(e), true); };

    switch (t) {
      case 'overview':
        this.admin.stats().subscribe({ next: (s) => { this.stats.set(s); done(); }, error: fail });
        break;
      case 'schemes':
        this.admin.schemes().subscribe({ next: (s) => { this.schemes.set(s); done(); }, error: fail });
        break;
      case 'applications':
        this.admin.applications(this.appStage(), this.appSearch()).subscribe({
          next: (a) => { this.applications.set(a); done(); }, error: fail,
        });
        break;
      case 'users':
        this.admin.users(this.userSearch(), this.userRole()).subscribe({
          next: (u) => { this.users.set(u); done(); }, error: fail,
        });
        break;
      case 'messages':
        this.admin.messages(this.msgStatus()).subscribe({
          next: (m) => { this.messages.set(m); done(); }, error: fail,
        });
        break;
    }
  }

  // ---------- schemes ----------
  openCreate(): void {
    this.editingId.set(null);
    this.formError.set('');
    this.schemeForm.reset({
      schemeId: '', name: '', authority: 'Central', category: '', description: '', subsidyText: '',
      minAge: null, maxAge: null, minInvestment: null, maxInvestment: null,
      businessTypes: [], isActive: true,
    });
    this.schemeForm.controls.schemeId.enable();
    this.editorOpen.set(true);
  }

  openEdit(s: AdminScheme): void {
    this.editingId.set(s.id);
    this.formError.set('');
    this.schemeForm.reset({
      schemeId: s.schemeId, name: s.name, authority: s.authority, category: s.category,
      description: s.description, subsidyText: s.subsidyText,
      minAge: s.minAge ?? null, maxAge: s.maxAge ?? null,
      minInvestment: s.minInvestment ?? null, maxInvestment: s.maxInvestment ?? null,
      businessTypes: [...s.businessTypes], isActive: s.isActive,
    });
    this.schemeForm.controls.schemeId.disable(); // slug is the stable identifier
    this.editorOpen.set(true);
  }

  closeEditor(): void {
    this.editorOpen.set(false);
  }

  hasType(t: string): boolean {
    return (this.schemeForm.controls.businessTypes.value ?? []).includes(t);
  }

  toggleType(t: string): void {
    const ctrl = this.schemeForm.controls.businessTypes;
    const cur = ctrl.value ?? [];
    ctrl.setValue(cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]);
    ctrl.markAsTouched();
  }

  saveScheme(): void {
    this.formError.set('');
    if (this.schemeForm.invalid) {
      this.schemeForm.markAllAsTouched();
      return;
    }
    const v = this.schemeForm.getRawValue();
    const num = (n: number | null) => (n === null || (n as unknown) === '' ? undefined : Number(n));

    if (num(v.minAge) !== undefined && num(v.maxAge) !== undefined && num(v.minAge)! > num(v.maxAge)!) {
      this.formError.set('Minimum age cannot be greater than maximum age.');
      return;
    }
    if (num(v.minInvestment) !== undefined && num(v.maxInvestment) !== undefined
        && num(v.minInvestment)! > num(v.maxInvestment)!) {
      this.formError.set('Minimum investment cannot be greater than maximum investment.');
      return;
    }

    const payload: SchemePayload = {
      schemeId: v.schemeId!.trim().toLowerCase(),
      name: v.name!.trim(),
      authority: v.authority!,
      category: v.category!.trim(),
      description: v.description!.trim(),
      subsidyText: v.subsidyText!.trim(),
      businessTypes: v.businessTypes!,
      isActive: !!v.isActive,
    };
    const optional = { minAge: num(v.minAge), maxAge: num(v.maxAge),
      minInvestment: num(v.minInvestment), maxInvestment: num(v.maxInvestment) };
    Object.entries(optional).forEach(([k, val]) => {
      if (val !== undefined) (payload as unknown as Record<string, unknown>)[k] = val;
    });

    this.saving.set(true);
    const id = this.editingId();
    const { schemeId: _slug, ...updatePayload } = payload;
    const req = id ? this.admin.updateScheme(id, updatePayload) : this.admin.createScheme(payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.editorOpen.set(false);
        this.notify(id ? 'Scheme updated.' : 'Scheme created.');
        this.loadTab('schemes');
      },
      error: (e: HttpErrorResponse) => {
        this.saving.set(false);
        this.formError.set(this.errText(e));
      },
    });
  }

  toggleSchemeActive(s: AdminScheme): void {
    this.admin.updateScheme(s.id, { isActive: !s.isActive }).subscribe({
      next: () => {
        this.schemes.update((list) => list.map((x) => (x.id === s.id ? { ...x, isActive: !s.isActive } : x)));
        this.notify(`${s.name} is now ${s.isActive ? 'hidden from' : 'visible to'} applicants.`);
      },
      error: (e: HttpErrorResponse) => this.notify(this.errText(e), true),
    });
  }

  deleteScheme(s: AdminScheme): void {
    if (!confirm(`Delete "${s.name}" permanently? Existing applications keep their record, but the scheme disappears. Consider hiding it instead.`)) return;
    this.admin.deleteScheme(s.id).subscribe({
      next: () => {
        this.schemes.update((l) => l.filter((x) => x.id !== s.id));
        this.notify('Scheme deleted.');
      },
      error: (e: HttpErrorResponse) => this.notify(this.errText(e), true),
    });
  }

  // ---------- applications ----------
  changeStage(a: AdminApplication, stage: Stage): void {
    if (stage === a.stage) return;
    this.admin.updateStage(a.id, stage, a.note).subscribe({
      next: () => {
        this.applications.update((l) => l.map((x) => (x.id === a.id ? { ...x, stage } : x)));
        this.notify(`Moved to "${stage}". The applicant has been notified.`);
      },
      error: (e: HttpErrorResponse) => {
        this.notify(this.errText(e), true);
        this.loadTab('applications');
      },
    });
  }

  // ---------- users ----------
  isSelf(u: AdminUser): boolean {
    return u.id === this.me()?.id;
  }

  toggleRole(u: AdminUser): void {
    const role = u.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`${role === 'admin' ? 'Give admin access to' : 'Remove admin access from'} ${u.name}?`)) return;
    this.patchUser(u, { role });
  }

  toggleActive(u: AdminUser): void {
    if (u.isActive && !confirm(`Deactivate ${u.name}? They will no longer be able to log in.`)) return;
    this.patchUser(u, { isActive: !u.isActive });
  }

  private patchUser(u: AdminUser, changes: { role?: 'user' | 'admin'; isActive?: boolean }): void {
    this.admin.updateUserAccess(u.id, changes).subscribe({
      next: (updated) => {
        this.users.update((l) => l.map((x) => (x.id === u.id ? updated : x)));
        this.notify('User updated.');
      },
      error: (e: HttpErrorResponse) => this.notify(this.errText(e), true),
    });
  }

  deleteUser(u: AdminUser): void {
    if (!confirm(`Permanently delete ${u.name} (${u.email}) and all of their applications? This cannot be undone.`)) return;
    this.admin.deleteUser(u.id).subscribe({
      next: () => {
        this.users.update((l) => l.filter((x) => x.id !== u.id));
        this.notify('User deleted.');
      },
      error: (e: HttpErrorResponse) => this.notify(this.errText(e), true),
    });
  }

  // ---------- messages ----------
  toggleMsg(m: ContactMsg): void {
    this.expandedMsg.set(this.expandedMsg() === m.id ? null : m.id);
  }

  setMsgStatus(m: ContactMsg, status: MessageStatus): void {
    this.admin.updateMessageStatus(m.id, status).subscribe({
      next: (u) => this.messages.update((l) => l.map((x) => (x.id === m.id ? u : x))),
      error: (e: HttpErrorResponse) => this.notify(this.errText(e), true),
    });
  }

  deleteMessage(m: ContactMsg): void {
    if (!confirm('Delete this message?')) return;
    this.admin.deleteMessage(m.id).subscribe({
      next: () => {
        this.messages.update((l) => l.filter((x) => x.id !== m.id));
        this.notify('Message deleted.');
      },
      error: (e: HttpErrorResponse) => this.notify(this.errText(e), true),
    });
  }

  mailto(m: ContactMsg): string {
    return `mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`;
  }

  // ---------- misc ----------
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private toastTimer?: ReturnType<typeof setTimeout>;
  private notify(text: string, error = false): void {
    this.toast.set({ text, error });
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }

  private errText(e: HttpErrorResponse): string {
    const errs = e.error?.errors as { message: string }[] | undefined;
    if (errs?.length) return errs.map((x) => x.message).join(' ');
    if (e.status === 403) return 'You do not have permission to do that.';
    return e.error?.message ?? 'Something went wrong. Please try again.';
  }
}
