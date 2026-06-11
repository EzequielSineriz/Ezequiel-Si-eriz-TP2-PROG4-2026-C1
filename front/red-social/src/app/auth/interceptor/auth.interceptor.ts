import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 🚨 Si el backend rechaza la petición por token vencido o alterado
      if (error.status === 401) {
        console.error('⚠️ Código 401: Token corrupto o expirado en el plano terrenal.');
        authService.ForzarDestierro(); // Limpia el localStorage y redirige al login
      }
      return throwError(() => error);
    })
  );
};
