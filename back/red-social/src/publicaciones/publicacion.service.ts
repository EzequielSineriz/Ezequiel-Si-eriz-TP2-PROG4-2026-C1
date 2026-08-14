import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './publicacion.schema';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { Usuario } from '../usuarios/usuario.schema';

@Injectable()
export class PublicacionService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
  ) {}

  // Crear una nueva publicación
  async crear(createDto: CreatePublicacionDto, autorId: string, imagenUrl?: string): Promise<any> {
    const nuevaPublicacion = new this.publicacionModel({
      ...createDto,
      autorId: autorId, // 🔮 Lo pasamos como string directo para que no choque con tu Schema
      imagenUrl: imagenUrl || '',
    });
    return await nuevaPublicacion.save();
  }

  // Traer todas las publicaciones (Para el Feed)
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

    if (publicacion.autorId.toString() !== usuarioId) {
      throw new UnauthorizedException('No tenés permisos para editar esta publicación.');
    }

    return await this.publicacionModel
      .findByIdAndUpdate(id, { $set: updateDto }, { new: true })
      .exec();
  }

  // Borrado lógico
  // Borrado lógico
async eliminar(id: string, usuario: any): Promise<any> {
  const publicacion = await this.obtenerPorId(id);

  // 1. Nos aseguramos de extraer el ID plano del autor de la publicación
  const idDelAutorEnBD = publicacion.autorId && typeof publicacion.autorId === 'object'
    ? (publicacion.autorId as any)._id.toString()
    : publicacion.autorId.toString();

  // 2. Nos aseguramos de extraer el ID plano del usuario logueado que viene de la request
  // A veces Mongoose inyecta un ObjectId o un objeto en req.user, forzamos a String.
  const idDelUsuarioLogueado = usuario._id ? usuario._id.toString() : usuario.toString();
  const perfilUsuarioLogueado = usuario.perfil || '';

  // 🔮 LOG DE PURIFICACIÓN: Mira esto en la terminal de NestJS cuando tires el tacho
  //console.log('--- DETECTANDO ENERGÍAS EN EL SERVIDOR ---');
  //console.log('ID Autor del Post en BD:', idDelAutorEnBD);
  //console.log('ID Usuario de la Request:', idDelUsuarioLogueado);
  //console.log('Perfil Usuario de la Request:', perfilUsuarioLogueado);

  const esDuenio = idDelAutorEnBD === idDelUsuarioLogueado;
  const esAdmin = perfilUsuarioLogueado === 'admin';

  //console.log('¿Es dueño?:', esDuenio, '| ¿Es Admin?:', esAdmin);

  if (!esDuenio && !esAdmin) {
    throw new UnauthorizedException('No tenés permisos para eliminar esta publicación.');
  }

  await this.publicacionModel.findByIdAndUpdate(id, { eliminada: true }).exec();
  return { mensaje: 'Publicación eliminada con éxito.' };
}

  // 👻 DAR/QUITAR LIKE (Arreglado el error de tipo de retorno BSON)
  async darLike(publicacionId: string, usuarioId: string): Promise<any> {
    const publicacion = await this.publicacionModel.findById(publicacionId);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    const yaDioLike = publicacion.usuariosQueDieronLike.includes(usuarioId);

    if (yaDioLike) {
      publicacion.usuariosQueDieronLike = publicacion.usuariosQueDieronLike.filter(id => id !== usuarioId);
    } else {
      publicacion.usuariosQueDieronLike.push(usuarioId);
      publicacion.usuariosQueDieronDislike = publicacion.usuariosQueDieronDislike.filter(id => id !== usuarioId);
    }

    publicacion.likes = publicacion.usuariosQueDieronLike.length;

    const guardado = await publicacion.save();
    return await guardado.populate({
      path: 'autorId',
      select: 'nombre apellido nombreUsuario avatarUrl'
    });
  }

  // 🛸 DAR/QUITAR DISLIKE (Arreglado el error de tipo de retorno BSON)
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
    return await guardado.populate({
      path: 'autorId',
      select: 'nombre apellido nombreUsuario avatarUrl'
    });
  }

  // 📊 MÉTRICAS DEL PERFIL (Arreglado pasándole el string directo en el objeto query)
  async obtenerMetricasPerfilUsuario(usuarioId: string): Promise<any> {
    // 1. Buscamos las últimas 3 publicaciones filtrando por string
    const ultimasPublicaciones = await this.publicacionModel
      .find({ autorId: usuarioId, eliminada: false }) // 🔮 Cambiado a 'usuarioId' string plano
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({
        path: 'comentarios',
        match: { eliminado: false },
        populate: { path: 'autorId', select: 'nombreUsuario avatarUrl' }
      })
      .exec();

    // 2. Contamos cuántas publicaciones totales tiene creadas
    const totalPublicaciones = await this.publicacionModel.countDocuments({ 
      autorId: usuarioId, // 🔮 Cambiado a 'usuarioId' string plano
      eliminada: false 
    });

    // 3. Calculamos la suma total de Me Gustas acumulados de TODOS sus posteos
    const todosSusPosteos = await this.publicacionModel.find({ 
      autorId: usuarioId, // 🔮 Cambiado a 'usuarioId' string plano
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