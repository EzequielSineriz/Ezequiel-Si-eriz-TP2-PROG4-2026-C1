import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Publicacion } from "src/publicaciones/publicacion.schema";
import { Comentario } from "./comentarios.schema";
import { CreateComentarioDto } from "./dtos/create-comentario.dto";

@Injectable()
export class ComentarioService {
  constructor(
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
  ) {}

  async crear(createDto: CreateComentarioDto, autorId: string) {
    const { publicacionId, contenido } = createDto;

    // Verificar si la publicación existe y no está eliminada
    const publicacion = await this.publicacionModel.findOne({ _id: publicacionId, eliminada: false });
    if (!publicacion) throw new NotFoundException('La publicación a comentar no existe o fue destruida.');

    // Crear el comentario
    const nuevoComentario = new this.comentarioModel({
      contenido,
      publicacionId: new Types.ObjectId(publicacionId),
      autorId: new Types.ObjectId(autorId)
    });
    const comentarioGuardado = await nuevoComentario.save();

    // Empujar el ID del comentario al array de la publicación original
    await this.publicacionModel.findByIdAndUpdate(publicacionId, {
      $push: { comentarios: comentarioGuardado._id }
    });

    // Lo retornamos populado para que el Front lo dibuje con nombre al instante
    return await comentarioGuardado.populate('autorId', 'nombre apellido nombreUsuario avatarUrl');
  }

  // 2. Obtener comentarios de una publicación específica
  async obtenerPorPublicacion(publicacionId: string) {
    return await this.comentarioModel
      .find({ publicacionId, eliminado: false })
      .sort({ createdAt: 1 }) // Los más viejos primero para seguir el hilo de la conversación
      .populate('autorId', 'nombre apellido nombreUsuario avatarUrl')
      .exec();
  }

  // 3. Borrado lógico de un comentario
  async eliminar(id: string, usuarioId: string) {
    const comentario = await this.comentarioModel.findById(id);
    if (!comentario || comentario.eliminado) throw new NotFoundException('El comentario no existe.');

    if (comentario.autorId.toString() !== usuarioId) {
      throw new UnauthorizedException('No tenés permisos para eliminar este comentario.');
    }

    comentario.eliminado = true;
    await comentario.save();

    // Opcional: Removerlo también del array de la publicación
    await this.publicacionModel.findByIdAndUpdate(comentario.publicacionId, {
      $pull: { comentarios: comentario._id }
    });

    return { mensaje: 'Comentario removido con éxito.' };
  }

  // 4. Reacción de LIKE (Toggle)
  async darLike(id: string, usuarioId: string) {
    const comentario = await this.comentarioModel.findById(id);
    if (!comentario) throw new NotFoundException('Comentario no encontrado.');

    const yaDioLike = comentario.usuariosQueDieronLike.includes(usuarioId);

    if (yaDioLike) {
      return await this.comentarioModel.findByIdAndUpdate(
        id,
        { $pull: { usuariosQueDieronLike: usuarioId }, $inc: { likes: -1 } },
        { new: true }
      ).populate('autorId', 'nombre apellido nombreUsuario avatarUrl');
    } else {
      return await this.comentarioModel.findByIdAndUpdate(
        id,
        {
          $addToSet: { usuariosQueDieronLike: usuarioId },
          $pull: { usuariosQueDieronDislike: usuarioId },
          // Recalculamos dinámicamente los likes totales basados en el incremento
          $inc: { likes: 1 } 
        },
        { new: true }
      ).populate('autorId', 'nombre apellido nombreUsuario avatarUrl');
    }
  }

  async darDislike(id: string, usuarioId: string) {
    const comentario = await this.comentarioModel.findById(id);
    if (!comentario) throw new NotFoundException('Comentario no encontrado.');

    const yaDioDislike = comentario.usuariosQueDieronDislike.includes(usuarioId);
    const yaDioLike = comentario.usuariosQueDieronLike.includes(usuarioId);

    // Definimos el cambio del contador de likes según corresponda si salta de un estado a otro
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

    async obtenerTodos() {
    return await this.comentarioModel
      .find({ eliminado: false })
      .sort({ createdAt: -1 }) // Los más nuevos primero
      .populate('autorId', 'nombre apellido nombreUsuario avatarUrl')
      .populate('publicacionId', 'contenido') // Para mostrar el contenido de la publicación asociada
      .exec();
  }


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
