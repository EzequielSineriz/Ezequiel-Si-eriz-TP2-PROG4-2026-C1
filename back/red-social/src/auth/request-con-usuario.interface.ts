// auth/interfaces/request-con-usuario.interface.ts
import { Request } from 'express';

export interface UsuarioDelToken {
  _id: string;
  email: string;
  nombreUsuario: string;
  perfil: string;
}

export interface RequestConUsuario extends Request {
  user: UsuarioDelToken;
}