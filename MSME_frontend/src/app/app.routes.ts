import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Schemes } from './pages/schemes/schemes';
import { SchemeDetails } from './pages/scheme-details/scheme-details';
import { EligibilityChecker } from './pages/eligibility-checker/eligibility-checker';
import { Documents } from './pages/documents/documents';
import { MyApplications } from './pages/my-applications/my-applications';
import { Contact } from './pages/contact/contact';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  { path: 'schemes', component: Schemes },
  { path: 'schemes/:id', component: SchemeDetails },
  { path: 'eligibility-checker', component: EligibilityChecker },
  { path: 'applications', component: MyApplications },
  { path: 'documents', component: Documents },
  { path: 'profile', component: Profile },
  { path: 'contact', component: Contact },
];