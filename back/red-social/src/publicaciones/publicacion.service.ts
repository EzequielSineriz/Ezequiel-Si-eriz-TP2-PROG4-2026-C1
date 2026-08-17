import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './publicacion.schema';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { Usuario } from '../usuarios/usuario.schema';
import { NotificationsGateway } from 'src/notificaciones/notificaciones.gateway';

@Injectable()
export class PublicacionService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // Crear una nueva publicación
  async crear(createDto: CreatePublicacionDto, autorId: string, imagenUrl?: string): Promise<any> {
    const nuevaPublicacion = new this.publicacionModel({
      ...createDto,
      autorId: autorId,
      imagenUrl: imagenUrl || '',
    });

    const guardado = await nuevaPublicacion.save();

    // Populamos el autor para tener nombre, avatar, etc.
    const publicacionPopulada = await this.publicacionModel
    .findById(guardado._id)
    .populate('autorId', 'nombre apellido nombreUsuario avatarUrl')
    .exec();

  // 📡 Emitimos la publicación completa a todos los clientes
  this.notificationsGateway.emitirPublicacionActualizada(publicacionPopulada);

  return publicacionPopulada;
  }

  // Traer todas las publicaciones
  async obtenerTodas(sort: string = 'fecha', limit: number = 5, offset: number = 0): Promise<any> {
    const orden = sort === 'likes' ? { likes: -1 } : { createdAt: -1 };

    return await this.publicacionModel
      .find({ eliminada: false }) 
      .sort(orden as any) 
      .skip(Number(offset)) 
      .limit(Number(limit))  
      .populate('autorId', 'nombre apellido nombreUsuario avatarUrl') 
      .populate({
        path: 'comentarios', 
        populate: { path: 'autorId', select: 'nombreUsuario avatarUrl' } 
      })
      .exec();
  }

  // Obtener una sola publicación por ID
  async obtenerPorId(id: string): Promise<any> {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, eliminada: false })
      .populate('autorId', 'nombre apellido nombreUsuario avatarUrl')
      .exec();

    if (!publicacion) {
      throw new NotFoundException('La publicación no existe o fue eliminada.');
    }
    return publicacion;
  }

  // Editar una publicación
  async actualizar(id: string, updateDto: UpdatePublicacionDto, usuarioId: string): Promise<any> {
    const publicacion = await this.obtenerPorId(id);

    if (publicacion.autorId._id.toString() !== usuarioId && publicacion.autorId.toString() !== usuarioId) {
      throw new ForbiddenException('No tenés permisos para editar esta publicación.');
    }

    const postActualizado = await this.publicacionModel
      .findByIdAndUpdate(id, { $set: updateDto }, { returnDocument: 'after' })
      .populate('autorId', 'nombre apellido nombreUsuario avatarUrl')
      .exec();

    // 📡 Emitir a todos el post editado
    this.notificationsGateway.emitirPublicacionActualizada(postActualizado);

    return postActualizado;
  }

  // Borrado lógico
  async eliminar(id: string, usuario: any): Promise<any> {
    const publicacion = await this.obtenerPorId(id);

    const idDelAutorEnBD = publicacion.autorId && typeof publicacion.autorId === 'object'
      ? (publicacion.autorId as any)._id.toString()
      : publicacion.autorId.toString();

    const idDelUsuarioLogueado = usuario._id ? usuario._id.toString() : usuario.toString();
    const perfilUsuarioLogueado = usuario.perfil || '';

    const esDuenio = idDelAutorEnBD === idDelUsuarioLogueado;
    const esAdmin = perfilUsuarioLogueado === 'admin';

    if (!esDuenio && !esAdmin) {
      throw new ForbiddenException('No tenés permisos para eliminar esta publicación.');
    }

    await this.publicacionModel.findByIdAndUpdate(id, { eliminada: true }).exec();
    return { mensaje: 'Publicación eliminada con éxito.' };
  }

  // 👻 DAR/QUITAR LIKE A POST
  async darLike(publicacionId: string, usuarioId: string): Promise<any> {
    const publicacion = await this.publicacionModel.findById(publicacionId);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    const yaDioLike = publicacion.usuariosQueDieronLike.includes(usuarioId);

    if (yaDioLike) {
      publicacion.usuariosQueDieronLike = publicacion.usuariosQueDieronLike.filter(id => id !== usuarioId);
    } else {
      publicacion.usuariosQueDieronLike.push(usuarioId);
      publicacion.usuariosQueDieronDislike = publicacion.usuariosQueDieronDislike.filter(id => id !== usuarioId);

      // 🔔 NOTIFICAR AL AUTOR DEL POST SÓLO CUANDO LE DAN LIKE
      const autorPostId = publicacion.autorId.toString();
      if (autorPostId !== usuarioId) {
        this.notificationsGateway.notificarUsuario(autorPostId, {
          mensaje: `A un investigador le gustó tu publicación`,
          publicacionId,
          fecha: new Date(),
        });
      }
    }

    publicacion.likes = publicacion.usuariosQueDieronLike.length;

    const guardado = await publicacion.save();
    const postPopulada = await guardado.populate({
      path: 'autorId',
      select: 'nombre apellido nombreUsuario avatarUrl'
    });

    // 📡 Emitir a todos el post actualizado
    this.notificationsGateway.emitirPublicacionActualizada(postPopulada),{
      _id: new Types.ObjectId().toString(),
      mensaje: `A un investigador le gustó tu reporte`,
      tipo: 'like', // 'like' | 'comentario' | 'seguimiento'
      fecha: new Date(),
      emisor: {
      nombreUsuario:publicacion.usuariosQueDieronLike.includes(usuarioId) ? 'Un investigador' : 'Alguien',
      avatarUrl: publicacion.imagenUrl,
      },
  publicacionId: publicacion._id,
  imagenPreview: publicacion.imagenUrl
    };

    return postPopulada;
  }

  // 🛸 DAR/QUITAR DISLIKE A POST
  async darDislike(publicacionId: string, usuarioId: string): Promise<any> {
    const publicacion = await this.publicacionModel.findById(publicacionId);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    const yaDioDislike = publicacion.usuariosQueDieronDislike.includes(usuarioId);

    if (yaDioDislike) {
      publicacion.usuariosQueDieronDislike = publicacion.usuariosQueDieronDislike.filter(id => id !== usuarioId);
    } else {
      publicacion.usuariosQueDieronDislike.push(usuarioId);
      publicacion.usuariosQueDieronLike = publicacion.usuariosQueDieronLike.filter(id => id !== usuarioId);
    }

    publicacion.likes = publicacion.usuariosQueDieronLike.length;

    const guardado = await publicacion.save();
    const postPopulada = await guardado.populate({
      path: 'autorId',
      select: 'nombre apellido nombreUsuario avatarUrl'
    });

    // 📡 Emitir a todos el post actualizado
    this.notificationsGateway.emitirPublicacionActualizada(postPopulada);

    return postPopulada;
  }

  // 📊 MÉTRICAS DEL PERFIL
  async obtenerMetricasPerfilUsuario(usuarioId: string): Promise<any> {
    const ultimasPublicaciones = await this.publicacionModel
      .find({ autorId: usuarioId, eliminada: false })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({
        path: 'comentarios',
        match: { eliminado: false },
        populate: { path: 'autorId', select: 'nombreUsuario avatarUrl' }
      })
      .exec();

    const totalPublicaciones = await this.publicacionModel.countDocuments({ 
      autorId: usuarioId, 
      eliminada: false 
    });

    const todosSusPosteos = await this.publicacionModel.find({ 
      autorId: usuarioId, 
      eliminada: false 
    });
    const meGustasTotales = todosSusPosteos.reduce((acumulador, post) => acumulador + (post.likes || 0), 0);

    return {
      ultimasPublicaciones,
      totalPublicaciones,
      meGustasTotales
    };
  }
}