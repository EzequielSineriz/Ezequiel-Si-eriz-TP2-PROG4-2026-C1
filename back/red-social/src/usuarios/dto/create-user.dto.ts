import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail, MinLength, IsDate, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';



export class UserRegisterDto {


  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del usuario' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString()
  apellido!: string;

  @ApiProperty({ example: 'juan.perez@example.com', description: 'Correo electrónico del usuario' })
  @IsEmail({}, { message: 'El formato del correo no es válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  email!: string;

  @ApiProperty({ example: 'juanperez123', description: 'Nombre de usuario único' })
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  nombreUsuario!: string;

  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una letra mayúscula y un número',
  })
  password!: string;

  @ApiProperty({ example: '1990-01-01', description: 'Fecha de nacimiento del usuario' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  @Type(() => Date)
  @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida' })
  fechaNacimiento!: Date;

  @ApiProperty({ example: 'Investigador paranormal', description: 'Descripción del usuario' })
  @IsString()
  descripcion?: string;

  }