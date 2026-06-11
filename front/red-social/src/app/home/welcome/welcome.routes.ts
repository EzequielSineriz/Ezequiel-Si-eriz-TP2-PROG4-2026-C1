// aca van a estar las rutas hijas de welcome, como my-profile, etc. para que se rendericen dentro del router-outlet de welcome.html
import { Routes } from '@angular/router';
import { authGuard } from '../../auth/guard/auth.guard';

export const welcomeRoutes: Routes = [
{
    path: '',
    loadComponent: () => import('./welcome/welcome').then((m) => m.Welcome),
    canActivate: [authGuard], // Protegemos toda la sección de home con el guardia de autenticación
    children: [
      {
        path: '', // Cuando la ruta sea /home a secas
        loadComponent: () => import('./feed/feed').then((m) => m.Feed),
      },
      {
        path: 'my-profile', // Cuando la ruta sea /home/my-profile
        loadComponent: () => import('./my-profile/my-profile').then((m) => m.MyProfile),
      },
      {
        path: 'publicaciones/:id', //  Cuando la ruta sea /home/publicaciones/6a25f5a...
        loadComponent: () => import('../publicaciones/publicacion.component').then((m) => m.DetallePublicacionComponent),
      }
    ]
  }
];

export default welcomeRoutes;


