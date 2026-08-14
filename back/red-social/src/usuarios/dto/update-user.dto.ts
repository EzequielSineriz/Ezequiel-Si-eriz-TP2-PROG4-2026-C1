import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer/types/decorators";
import { IsDate, IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class UpdateUserDto {
   

     @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
     @IsNotEmpty({ message: 'El nombre es requerido' })
     @IsString()
     nombre?: string;
   
     @ApiProperty({ example: 'Pérez', description: 'Apellido del usuario' })
     @IsNotEmpty({ message: 'El apellido es requerido' })
     @IsString()
     apellido?: string;
   
     @ApiProperty({ example: 'juan.perez@example.com', description: 'Correo electrónico del usuario' })
     @IsEmail({}, { message: 'El formato del correo no es válido' })
     @IsNotEmpty({ message: 'El correo es requerido' })
     email?: string;
   
     @ApiProperty({ example: 'juanperez', description: 'Nombre de usuario' })
     @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
     nombreUsuario?: string;
   
     @ApiProperty({ example: 'Password123', description: 'Contraseña del usuario' })
     // Al menos 8 caracteres, una mayúscula y un número (requisito del TP)
     @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
     @Matches(/(?=.*[A-Z])(?=.*\d)/, {
       message: 'La contraseña debe contener al menos una letra mayúscula y un número',
     })
     password?: string;
   
     @ApiProperty({ example: '1990-01-01', description: 'Fecha de nacimiento del usuario' })
     @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
     @Type(() => Date)
     @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida' })
     fechaNacimiento?: Date;
   
     @ApiProperty({ example: 'Descripción del usuario', description: 'Descripción del usuario' })
     @IsString()
     descripcion?: string;
   
  }