import { IAutor } from '../publicaciones.interface'; // Asegurate de importar tu interfaz de autor

export interface IComentario {
  _id: string;
  contenido: string;
  autorId: IAutor; // Viene siempre populado desde el backend
  publicacionId: string;
  likes: number;
  usuariosQueDieronLike: string[];
  usuariosQueDieronDislike: string[];
  eliminado: boolean;
  modificado?: boolean;
  fechaModificacion?: string;
  createdAt: string;
  updatedAt: string;
}
