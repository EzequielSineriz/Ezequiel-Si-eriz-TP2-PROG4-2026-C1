export interface UsuarioDashboard {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  fechaNacimiento: string; // Podés formatear esto como quieras en el frontend
  descripcion?: string;
  avatarUrl?: string;
  perfil: 'usuario' | 'admin';
  activo: boolean;
}
