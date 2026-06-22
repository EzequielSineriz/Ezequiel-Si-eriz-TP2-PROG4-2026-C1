import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usamos el getter reactivo 'esAdmin' que ya programaste en tu AuthService
  if (authService.esAdmin) {
    return true; // Acceso permitido a las pantallas ocultas de gestión
  }

  // Si es un usuario común intentando forzar la URL, lo mandamos al feed de bienvenida
  console.warn('⛔ Intento de intrusión detectado en zona de Administrador.');
  router.navigate(['/home']); 
  return false;
};