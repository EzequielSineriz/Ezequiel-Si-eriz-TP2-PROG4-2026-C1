import { IsNotEmpty, IsString, IsMongoId, MaxLength } from 'class-validator';

export class CreateComentarioDto {
  @IsNotEmpty({ message: 'El contenido del comentario es obligatorio.' })
  @IsString({ message: 'El contenido debe ser una cadena de texto.' })
  @MaxLength(300, { message: 'El comentario no puede superar los 300 caracteres.' })
  contenido!: string;

  @IsNotEmpty({ message: 'El ID de la publicación es requerido para indexar el comentario.' })
  @IsMongoId({ message: 'El ID de la publicación debe ser un ObjectId válido de Mongoose.' })
  publicacionId!: string;
}