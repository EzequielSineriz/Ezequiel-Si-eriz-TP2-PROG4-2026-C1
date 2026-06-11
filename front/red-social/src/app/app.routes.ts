import { Routes } from '@angular/router';
import { Loading } from './home/welcome/loading/loading';

export const routes: Routes = [
{
    path: '',
    component: Loading,
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.default),
  },
  {
    path: 'home',
    loadChildren: () => import('./home/welcome/welcome.routes').then((m) => m.default),
  },
  // 🔄 Si ponen cualquier otra ruta que no exista, los mandamos a re-validar a la raíz
  {
    path: '**',
    redirectTo: 'auth/login',
  }
];
