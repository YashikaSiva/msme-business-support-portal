import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Only lets logged-in users with role "admin" into /admin.
// (The backend enforces this too — this just avoids showing a broken page.)
export const adminGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return true; // pages render client-side only

  const auth = inject(Auth);
  const router = inject(Router);
  const user = auth.currentUser();

  if (!user) return router.createUrlTree(['/login']);
  if (user.role !== 'admin') return router.createUrlTree(['/dashboard']);
  return true;
};
