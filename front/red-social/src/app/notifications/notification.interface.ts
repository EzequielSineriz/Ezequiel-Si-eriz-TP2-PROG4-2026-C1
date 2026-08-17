export interface INotificacion {
  _id?: string;
  mensaje: string;
  tipo?: 'like' | 'comentario' | 'seguimiento';
  fecha: Date | string;
  emisor?: {
    nombreUsuario: string;
    avatarUrl?: string;
  };
  publicacionId?: string;
  imagenPreview?: string;
}
