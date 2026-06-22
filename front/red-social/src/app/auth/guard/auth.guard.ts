import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si hay un usuario activo en el Signal reactivo
  if (authService.usuarioActual()) {
    return true; // Acceso concedido al entorno seguro (Feed, Perfil, etc.)
  }

  // Si no hay sesión activa en RAM, directo al login
  console.warn('🔮 Acceso denegado: No se detectaron energías activas. Redirigiendo...');
  router.navigate(['/auth/login']);
  return false;
};
