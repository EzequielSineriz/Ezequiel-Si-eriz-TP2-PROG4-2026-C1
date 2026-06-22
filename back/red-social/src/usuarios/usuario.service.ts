import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './usuario.schema';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsuariosService {
constructor(@InjectModel('Usuario') private readonly usuarioModel: Model<Usuario>) {}

// 1. Obtener la lista de usuarios completa para el Dashboard
  async listarTodosLosUsuarios(): Promise<Usuario[]> {
    return this.usuarioModel.find().select('-password').exec();
  }

  // 2. Crear un usuario desde el panel del admin (con rol configurable)
  async crearUsuarioDesdeAdmin(datos: any): Promise<Usuario> {
    const { email, nombreUsuario, password, perfil } = datos;

    // Validaciones básicas de unicidad
    const existeEmail = await this.usuarioModel.findOne({ email });
    if (existeEmail) throw new BadRequestException('El email ya está registrado.');

    const existeUsername = await this.usuarioModel.findOne({ nombreUsuario });
    if (existeUsername) throw new BadRequestException('El nombre de usuario ya existe.');

    // Hashear contraseña idéntico a tu Auth clásico
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoUsuario = new this.usuarioModel({
      ...datos,
      password: hashedPassword,
      perfil: perfil || 'usuario', // 'usuario' o 'administrador' que viaja desde el radio-button
      activo: true
    });

    const guardado = await nuevoUsuario.save();
    const resultado = guardado.toObject();
    delete (resultado as any).password;
    return resultado as any;
  }

  // 3. Manejar altas y bajas lógicas (Modificar flag activo)
  async modificarEstadoActivo(userId: string, estado: boolean): Promise<{ mensaje: string }> {
    const usuario = await this.usuarioModel.findByIdAndUpdate(
      userId,
      { $set: { activo: estado } },
      { new: true }
    );

    if (!usuario) {
      throw new NotFoundException('No se encontró el usuario en este plano.');
    }

    const accion = estado ? 'habilitado' : 'deshabilitado';
    return { mensaje: `El usuario ha sido ${accion} con éxito.` };
  }



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