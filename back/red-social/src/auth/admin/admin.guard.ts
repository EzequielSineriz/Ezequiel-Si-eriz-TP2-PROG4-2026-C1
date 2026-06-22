import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest();

    // 1. Recuperamos el usuario que inyectó el TokenGuard previo
    const usuario = req.user;

    // 2. Si por alguna razón no hay usuario o el perfil no es admin, cortamos el acceso
    // Usamos ForbiddenException (403) porque el token es válido, pero no tiene permisos
    if (!usuario || usuario.perfil !== 'admin') {
      throw new ForbiddenException('Acceso denegado: Se requieren permisos de Administrador.');
    }

    return true; // Acceso concedido
  }
}