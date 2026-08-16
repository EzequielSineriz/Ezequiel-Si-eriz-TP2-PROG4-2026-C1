import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Publicacion } from "src/publicaciones/publicacion.schema";
import { Comentario } from "./comentarios.schema";
import { CreateComentarioDto } from "./dtos/create-comentario.dto";
import { NotificationsGateway } from "src/notificaciones/notificaciones.gateway";

@Injectable()
export class ComentarioService {
  constructor(
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}


  // 1. Crear un comentario
  async crear(createDto: CreateComentarioDto, autorId: string) {
    const { publicacionId, contenido } = createDto;

    const publicacion = await this.publicacionModel.findOne({ _id: publicacionId, eliminada: false });
    if (!publicacion) throw new NotFoundException('La publicación a comentar no existe o fue destruida.');

    const nuevoComentario = new this.comentarioModel({
      contenido,
      publicacionId: new Types.ObjectId(publicacionId),
      autorId: new Types.ObjectId(autorId)
    });
    const comentarioGuardado = await nuevoComentario.save();

    // 🔔 NOTIFICAR AL AUTOR DEL POST
    const autorPostId = publicacion.autorId.toString();
    if (autorPostId !== autorId) {
      this.notificationsGateway.notificarUsuario(autorPostId, {
        mensaje: `Un investigador respondió a tu publicación: "${contenido.substring(0, 20)}..."`,
        publicacionId: publicacion._id,
        fecha: new Date(),
      });
    }

    // 🔄 Obtener la publicación actualizada con sus populates
    const publicacionActualizada = await this.publicacionModel.findByIdAndUpdate(
      publicacionId,
      { $push: { comentarios: comentarioGuardado._id } },
      { new: true }
    )
    .populate('autorId', 'nombre apellido nombreUsuario avatarUrl')
    .populate('comentarios');

    const comentarioPoblado = await comentarioGuardado.populate('autorId', 'nombre apellido nombreUsuario avatarUrl');

    return {
      comentario: comentarioPoblado,
      publicacionActualizada,
    };
  }

  // 3. Borrado lógico
  async eliminar(id: string, usuario: { _id: string; perfil: string }) {
    const comentario = await this.comentarioModel.findById(id);
    if (!comentario || comentario.eliminado) {
      throw new NotFoundException('El comentario no existe.');
    }

    const esDuenio = comentario.autorId.toString() === usuario._id.toString();
    const esAdmin = usuario.perfil === 'admin';

    if (!esDuenio && !esAdmin) {
      throw new UnauthorizedException('No tenés permisos para eliminar este comentario.');
    }

    comentario.eliminado = true;
    await comentario.save();

    // 🔄 Obtener la publicación actualizada al remover el comentario
    const publicacionActualizada = await this.publicacionModel.findByIdAndUpdate(
      comentario.publicacionId,
      { $pull: { comentarios: comentario._id } },
      { new: true }
    )
    .populate('autorId', 'nombre apellido nombreUsuario avatarUrl')
    .populate('comentarios');

    return { 
      mensaje: 'Comentario eliminado con éxito.',
      publicacionActualizada,
    };
  }
  

  // 2. Obtener comentarios de una publicación
  async obtenerPorPublicacion(publicacionId: string) {
    return await this.comentarioModel
      .find({ publicacionId, eliminado: false })
      .sort({ createdAt: 1 })
      .populate('autorId', 'nombre apellido nombreUsuario avatarUrl')
      .exec();
  }

  // 3. Borrado lógico
 

  // 4. Reacción de LIKE a Comentario
  async darLike(id: string, usuarioId: string) {
    const comentario = await this.comentarioModel.findById(id);
    if (!comentario) throw new NotFoundException('Comentario no encontrado.');

    const yaDioLike = comentario.usuariosQueDieronLike.includes(usuarioId);
    let comentarioActualizado;

    if (yaDioLike) {
      comentarioActualizado = await this.comentarioModel.findByIdAndUpdate(
        id,
        { $pull: { usuariosQueDieronLike: usuarioId }, $inc: { likes: -1 } },
        { new: true }
      ).populate('autorId', 'nombre apellido nombreUsuario avatarUrl');
    } else {
      comentarioActualizado = await this.comentarioModel.findByIdAndUpdate(
        id,
        {
          $addToSet: { usuariosQueDieronLike: usuarioId },
          $pull: { usuariosQueDieronDislike: usuarioId },
          $inc: { likes: 1 } 
        },
        { new: true }
      ).populate('autorId', 'nombre apellido nombreUsuario avatarUrl');

      // 🔔 NOTIFICAR AL AUTOR DEL COMENTARIO
      const autorComentarioId = comentario.autorId.toString();
      if (autorComentarioId !== usuarioId) {
        this.notificationsGateway.notificarUsuario(autorComentarioId, {
          mensaje: `A un usuario le gustó tu comentario`,
          publicacionId: comentario.publicacionId,
          fecha: new Date(),
        });
      }
    }

    return comentarioActualizado;
  }

  // 5. Reacción de DISLIKE a Comentario
  async darDislike(id: string, usuarioId: string) {
    const comentario = await this.comentarioModel.findById(id);
    if (!comentario) throw new NotFoundException('Comentario no encontrado.');

    const yaDioDislike = comentario.usuariosQueDieronDislike.includes(usuarioId);
    const yaDioLike = comentario.usuariosQueDieronLike.includes(usuarioId);

    let incrementoLikes = 0;
    if (yaDioLike) incrementoLikes = -1;

    if (yaDioDislike) {
      return await this.comentarioModel.findByIdAndUpdate(
        id,
        { $pull: { usuariosQueDieronDislike: usuarioId } },
        { new: true }
      ).populate('autorId', 'nombre apellido nombreUsuario avatarUrl');
    } else {
      return await this.comentarioModel.findByIdAndUpdate(
        id,
        {
          $addToSet: { usuariosQueDieronDislike: usuarioId },
          $pull: { usuariosQueDieronLike: usuarioId },
          $inc: { likes: incrementoLikes }
        },
        { new: true }
      ).populate('autorId', 'nombre apellido nombreUsuario avatarUrl');
    }
  }

  // 6. Obtener todos los comentarios
  async obtenerTodos(limit = 20, offset = 0) {
    return this.comentarioModel
      .find({ eliminado: false })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('autorId', 'nombre apellido nombreUsuario avatarUrl')
      .populate('publicacionId', 'contenido')
      .exec();
  }

  // 7. Modificar comentario
  async modificar(id: string, contenido: string, usuarioId: string) {
    const comentario = await this.comentarioModel.findById(id);
    if (!comentario) throw new NotFoundException('El testimonio ya no existe.');

    if (comentario.autorId.toString() !== usuarioId.toString()) {
      throw new UnauthorizedException('No alteres las memorias de otros investigadores.');
    }

    return await this.comentarioModel.findByIdAndUpdate(
      id,
      { 
        $set: { 
          contenido, 
          modificado: true, 
          fechaModificacion: new Date() 
        } 
      },
      { new: true }
    ).exec();
  }
}