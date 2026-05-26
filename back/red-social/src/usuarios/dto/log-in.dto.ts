import { IsNotEmpty, IsString } from "class-validator";

export class UsuarioLoginDTO {
  @IsNotEmpty({ message: 'El correo o nombre de usuario es requerido' })
  @IsString()
  loginIdentifier!: string; // 👈 Cambiado a un nombre genérico

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  password!: string;
}
