import { Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';

// Define your routes to other components
export const routes: Routes = [
  { 
    path: '', 
    component: AuthenticationComponent 
  },
  { 
    path: 'authentication', 
    loadComponent: () => import('./authentication/authentication.component')
      .then(a => a.AuthenticationComponent) 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];