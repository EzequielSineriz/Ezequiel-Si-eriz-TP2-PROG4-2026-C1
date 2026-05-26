import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum } from "class-validator";

export class CreatePublicacionDto {
  @IsNotEmpty({ message: 'El contenido de la publicación no puede estar vacío.' })
  @IsString()
  contenido!: string;

  @IsNotEmpty({ message: 'La categoría es requerida.' })
  @IsEnum(['fantasmas', 'ovnis', 'mitologia', 'general'], {
    message: 'La categoría debe ser: fantasmas, ovnis, mitologia o general'
  })
  categoria!: string;

  @IsOptional()
  @IsArray({ message: 'Las etiquetas deben ser una lista de textos.' })
  @IsString({ each: true })
  etiquetas?: string[];
  
}