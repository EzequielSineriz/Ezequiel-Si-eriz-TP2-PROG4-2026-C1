import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './usuario.schema';

@Injectable()
export class UsuariosService {
constructor(@InjectModel('Usuario') private readonly usuarioModel: Model<Usuario>) {}

  async actualizarPerfil(userId: string, descripcion?: string, avatarUrl?: string): Promise<Usuario> {
    const camposAActualizar: any = {};
    
    if (descripcion !== undefined) camposAActualizar.descripcion = descripcion;
    if (avatarUrl !== undefined) camposAActualizar.avatarUrl = avatarUrl;

    const usuarioActualizado = await this.usuarioModel.findByIdAndUpdate(
      userId,
      { $set: camposAActualizar },
      { new: true } // Para que devuelva el documento ya modificado
    ).select('-password'); // Protegemos la contraseña por seguridad espectral

    if (!usuarioActualizado) {
      throw new NotFoundException('El investigador no ha sido hallado en este plano.');
    }

    return usuarioActualizado;
  }}