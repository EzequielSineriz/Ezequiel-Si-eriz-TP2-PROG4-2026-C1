import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // 🔮 Buscamos el token recién guardado en la señal reactiva
  // Si tu login guarda todo en usuarioActual, extraelo de ahí:
  const token = localStorage.getItem('paranormal_token');

  if (token) {
    // Clonamos la petición e inyectamos el Bearer que tu TokenGuard de NestJS espera
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
