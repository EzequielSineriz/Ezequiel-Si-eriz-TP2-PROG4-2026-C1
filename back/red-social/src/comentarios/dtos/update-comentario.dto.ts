import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateComentarioDto {
  @ApiProperty({
    example: 'Si yo tambien vi la mima luz, fue muy raro',
    description: 'Comentario a una publicación, máximo 300 caracteres.',
  })
  @IsNotEmpty({ message: 'El contenido modificado no puede estar vacío.' })
  @IsString({ message: 'El contenido debe ser texto plano.' })
  @MaxLength(300, { message: 'El comentario no puede superar los 300 caracteres.' })
  contenido!: string;
}