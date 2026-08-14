import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './usuario.schema';
import * as bcrypt from 'bcrypt';
import { UserRegisterDto } from './dto/create-user.dto';
import { UserAdminRegisterDto } from './dto/admin-create-user.dto';

@Injectable()
export class UsuariosService {
  constructor(@InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>) {}

  // Único lugar donde se crea un usuario -- lo usan tanto el registro público
  // como el alta desde el panel de admin, así no queda lógica duplicada.
  private async crearUsuario(
    datos: UserRegisterDto,
    avatarUrl: string | undefined,
    perfil: string,
  ): Promise<Usuario> {
    const existeUsuario = await this.usuarioModel.findOne({
      $or: [{ email: datos.email }, { nombreUsuario: datos.nombreUsuario }],
    });

    if (existeUsuario) {
      throw new BadRequestException('El correo o el nombre de usuario ya están registrados.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(datos.password, salt);

    const nuevoUsuario = new this.usuarioModel({
      ...datos,
      password: passwordEncriptada,
      avatarUrl: avatarUrl || '',
      perfil,
      activo: true,
    });

    return nuevoUsuario.save();
  }

  // Registro público -- el perfil siempre queda en 'usuario', sin excepción.
  async registrarPublico(datos: UserRegisterDto, avatarUrl?: string): Promise<Usuario> {
    return this.crearUsuario(datos, avatarUrl, 'usuario');
  }

  // Alta desde el panel de admin -- acá sí se puede elegir el perfil,
  // porque el endpoint ya está protegido con TokenGuard + AdminGuard.
  async crearUsuarioDesdeAdmin(datos: UserAdminRegisterDto, avatarUrl?: string): Promise<Usuario> {
    const usuario = await this.crearUsuario(datos, avatarUrl, datos.perfil || 'usuario');
    const resultado = usuario.toObject();
    delete (resultado as any).password;
    return resultado as any;
  }

  async buscarPorEmailOUsername(identifier: string) {
    return this.usuarioModel.findOne({
      $or: [{ email: identifier }, { nombreUsuario: identifier }],
    });
  }

  findByEmail(email: string) {
    return this.usuarioModel.exists({ email });
  }

  // Paginado -- antes traía todos los usuarios sin límite
  async listarTodosLosUsuarios(limit = 20, offset = 0): Promise<Usuario[]> {
    return this.usuarioModel
      .find()
      .select('-password')
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async modificarEstadoActivo(userId: string, estado: boolean): Promise<{ mensaje: string }> {
    const usuario = await this.usuarioModel.findByIdAndUpdate(
      userId,
      { $set: { activo: estado } },
      { new: true },
    );

    if (!usuario) {
      throw new NotFoundException('No se encontró el usuario.');
    }

    const accion = estado ? 'habilitado' : 'deshabilitado';
    return { mensaje: `El usuario ha sido ${accion} con éxito.` };
  }

  async actualizarPerfil(userId: string, descripcion?: string, avatarUrl?: string): Promise<Usuario> {
    const camposAActualizar: any = {};

    if (descripcion !== undefined) camposAActualizar.descripcion = descripcion;
    if (avatarUrl !== undefined) camposAActualizar.avatarUrl = avatarUrl;

    const usuarioActualizado = await this.usuarioModel
      .findByIdAndUpdate(userId, { $set: camposAActualizar }, { new: true })
      .select('-password');

    if (!usuarioActualizado) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return usuarioActualizado;
  }
}