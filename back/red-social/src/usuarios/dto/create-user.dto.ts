import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail, MinLength, IsDate, Matches } from 'class-validator';


export class UserRegisterDto {


  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  nombre!: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString()
  apellido!: string;

  @IsEmail({}, { message: 'El formato del correo no es válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  email!: string;

  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  nombreUsuario!: string;

  // Al menos 8 caracteres, una mayúscula y un número
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una letra mayúscula y un número',
  })
  password!: string;

  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  @Type(() => Date)
  @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida' })
  fechaNacimiento!: Date;

  @IsString()
  descripcion?: string;

  }