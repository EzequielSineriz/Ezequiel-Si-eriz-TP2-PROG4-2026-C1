import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateComentarioDto {
  @IsNotEmpty({ message: 'El contenido modificado no puede estar vacío.' })
  @IsString({ message: 'El contenido debe ser texto plano.' })
  @MaxLength(300, { message: 'El comentario no puede superar los 300 caracteres.' })
  contenido!: string;
}