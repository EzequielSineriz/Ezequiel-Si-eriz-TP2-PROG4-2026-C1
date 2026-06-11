
export interface IRegistro {
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  password: string;
  fechaNacimiento: string;
  descripcion?: string;
}

export interface ILogin {
  loginIdentifier: string; // Puede ser email o nombreUsuario
  password: string;
}

export interface IAuthResponse {
  token: string;
  user: {
    _id: string;
    nombreUsuario: string;
    email: string;
    avatarUrl?: string;
    descripcion?: string;
  };
}
