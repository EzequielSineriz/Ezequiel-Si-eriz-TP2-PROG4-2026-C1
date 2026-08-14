import { IsNotEmpty, IsString, IsMongoId, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComentarioDto {
  @ApiProperty({
    example: 'Si yo tambien vi la mima luz, fue muy raro',
    description: 'Comentario a una publicación, máximo 300 caracteres.',
  })
  @IsNotEmpty({ message: 'El contenido del comentario es obligatorio.' })
  @IsString({ message: 'El contenido debe ser una cadena de texto.' })
  @MaxLength(300, { message: 'El comentario no puede superar los 300 caracteres.' })
  contenido!: string;

  @ApiProperty({
    example: '64a1f2e3b4c5d6e7f8g9h0i1',
    description: 'ID de la publicación a la que pertenece el comentario.',
  })
  @IsNotEmpty({ message: 'El ID de la publicación es requerido para indexar el comentario.' })
  @IsMongoId({ message: 'El ID de la publicación debe ser un ObjectId válido de Mongoose.' })
  publicacionId!: string;
}