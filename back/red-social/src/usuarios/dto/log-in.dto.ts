import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';


export class UsuarioLoginDTO {

  @ApiProperty({ example: 'juan.perez@mail.com', description: 'Email o nombre de usuario' })
  @IsNotEmpty({ message: 'El correo o nombre de usuario es requerido' })
  @IsString()
  loginIdentifier!: string; // 👈 Cambiado a un nombre genérico

  @ApiProperty({ example: 'Password123', description: 'Contraseña del usuario' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  password!: string;
}
