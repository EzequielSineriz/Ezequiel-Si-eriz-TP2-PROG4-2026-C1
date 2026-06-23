import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRegisterDto } from './create-user.dto'; 

export class UserAdminRegisterDto extends UserRegisterDto {
  
  @IsString({ message: 'El perfil debe ser una cadena de texto válida' })
  @IsOptional() // O IsNotEmpty() si querés forzar que siempre se envíe
  @IsEnum(['usuario', 'admin'], { message: 'El perfil debe ser usuario o admin' })
  perfil?: string;

}