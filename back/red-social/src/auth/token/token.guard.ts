import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';


@Injectable()
export class TokenGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const http = context.switchToHttp();
    const req: Request = http.getRequest();

    const authorization = req.headers.authorization; // "Bearer eyj...token..."

    if (!authorization) {
      throw new UnauthorizedException('No se proporcionó un token de autenticación.');
    }

    const token = authorization.replace('Bearer ', '') || '';

    try {
      // Verificamos el token con la clave secreta
      const verificado = verify(token, process.env.CLAVE_SUPERSECRETA!); 

      // Tipamos lo que viene adentro del token (lo que guardamos en el AuthService)
      const payloadDecodificado = verificado as { 
        _id: string; 
        email: string; 
        nombreUsuario: string; 
        perfil: string; 
      };

      // 💡 LA CLAVE: Guardamos TODO el objeto del usuario dentro de la request.
      // Express nos permite dinámicamente adjuntar propiedades a 'req'.
      (req as any).user = payloadDecodificado;

      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error al validar el token:', error.message);
      }
      // El TP pide taxativamente devolver 401 Unauthorized si falla el token
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }
}
