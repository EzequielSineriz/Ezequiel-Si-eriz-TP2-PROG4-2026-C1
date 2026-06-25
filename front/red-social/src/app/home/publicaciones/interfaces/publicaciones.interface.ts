export interface IAutor {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string; // <-- Sincronizado con NestJS (no 'username')
  avatarUrl?: string;    // <-- Sincronizado con NestJS (no 'avatarIcon')
}

export interface IPublicacion {
  _id: string;
  contenido: string;
  autorId: string | IAutor; // Cuando se lista viene populado como IAutor
  imagenUrl?: string;
  categoria: 'fantasmas' | 'ovnis' | 'mitologia' | 'general';
  comentarios: string[];
  likes: number;
  eliminada: boolean;
  usuariosQueDieronLike: string[];
  usuariosQueDieronDislike: string[];
  createdAt: string;
  updatedAt: string;
}
