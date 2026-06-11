import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si existe el token guardado en el plano terrenal del navegador
  if (authService.usuarioActual()) {
    return true; // Acceso concedido al plano home
  }

  // Si no está validado todavía pero hay un token dando vueltas, lo mandamos a la precarga
  if (localStorage.getItem('paranormal_token')) {
    router.navigate(['/']);
    return false;
  }

  // Si no hay nada de nada, directo al calabozo del login
  router.navigate(['/auth/login']);
  return false;
};
