import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreatePublicacionDto {

  @ApiProperty({
    example: 'Durante la medianoche del martes observamos tres esferas de luz...',
    description: 'Contenido completo del reporte',
    required: true,
  })
  @IsNotEmpty({ message: 'El contenido de la publicación no puede estar vacío.' })
  @IsString()
  contenido!: string;

  
  @ApiProperty({
    example: 'fantasmas',
    description: 'Categoría de la publicación',
    enum: ['fantasmas', 'ovnis', 'mitologia', 'general'],
    required: true,
  })
  @IsNotEmpty({ message: 'La categoría es requerida.' })
  @IsEnum(['fantasmas', 'ovnis', 'mitologia', 'general'], {
    message: 'La categoría debe ser: fantasmas, ovnis, mitologia o general'
  })
  categoria!: string;


  @ApiProperty({
    example: ['misterio', 'paranormal'],
    description: 'Etiquetas asociadas a la publicación',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las etiquetas deben ser una lista de textos.' })
  @IsString({ each: true })
  etiquetas?: string[];

  @ApiProperty({ type: 'string', format: 'binary', description: 'Imagen de la publicación', required: false })
  imagen?: any;
  
}