import { RenderMode, ServerRoute } from '@angular/ssr';

// All pages depend on the logged-in user (localStorage) and live API data,
// so they must render in the browser. Prerendering them at build time froze
// the "Loading schemes..." state and broke the dynamic /schemes/:id route.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
