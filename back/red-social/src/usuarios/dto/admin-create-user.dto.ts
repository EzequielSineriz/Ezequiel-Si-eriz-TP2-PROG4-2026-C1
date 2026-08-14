import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRegisterDto } from './create-user.dto'; 
import { ApiProperty } from '@nestjs/swagger';


export class UserAdminRegisterDto extends UserRegisterDto {
  @ApiProperty({
    example: 'usuario',
    description: 'Perfil del usuario a crear',
    enum: ['usuario', 'admin'],
    required: false,
    default: 'usuario',
  })
  @IsString({ message: 'El perfil debe ser una cadena de texto válida' })
  @IsOptional()
  @IsEnum(['usuario', 'admin'], { message: 'El perfil debe ser usuario o admin' })
  perfil?: string;

}