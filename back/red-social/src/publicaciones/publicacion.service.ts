import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './publicacion.schema';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';


@Injectable()
export class PublicacionService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
  ) {}

  // Crear una nueva publicación
  async crear(createDto: CreatePublicacionDto, autorId: string, imagenUrl?: string) {
    const nuevaPublicacion = new this.publicacionModel({
      ...createDto,
      autorId: new Types.ObjectId(autorId), // Vinculamos el ID como ObjectId real
      imagenUrl: imagenUrl || '',
    });
    return await nuevaPublicacion.save();
  }

  // Traer todas las publicaciones (Para el Feed)
  async obtenerTodas() {
    return await this.publicacionModel
      .find({ eliminada: false }) // Solo las que no se borraron
      .sort({ createdAt: -1 })   // Las más recientes primero (gracias a timestamps: true)
      .populate('autorId', 'nombre apellido nombreUsuario avatarUrl') // ¡Mapea los datos del creador!
      .exec();
  }

  // Obtener una sola publicación por ID
  async obtenerPorId(id: string) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, eliminada: false })
      .populate('autorId', 'nombre apellido nombreUsuario avatarUrl')
      .exec();

    if (!publicacion) {
      throw new NotFoundException('La publicación no existe o fue eliminada.');
    }
    return publicacion;
  }

  // Editar una publicación (Validando que el que edita sea el dueño)
  async actualizar(id: string, updateDto: UpdatePublicacionDto, usuarioId: string) {
    const publicacion = await this.obtenerPorId(id);

    // Seguridad: Si el autorId del post no coincide con el id del token, afuera
    if (publicacion.autorId.toString() !== usuarioId) {
      throw new UnauthorizedException('No tenés permisos para editar esta publicación.');
    }

    return await this.publicacionModel
      .findByIdAndUpdate(id, { $set: updateDto }, { new: true })
      .exec();
  }

  // Borrado lógico (No destruye el dato, cambia el flag 'eliminada' a true)
  async eliminar(id: string, usuarioId: string) {
    const publicacion = await this.obtenerPorId(id);

    if (publicacion.autorId.toString() !== usuarioId) {
      throw new UnauthorizedException('No tenés permisos para eliminar esta publicación.');
    }

    await this.publicacionModel.findByIdAndUpdate(id, { eliminada: true }).exec();
    return { mensaje: 'Publicación eliminada con éxito.' };
  }

  // 👻 DAR/QUITAR LIKE
async darLike(publicacionId: string, usuarioId: string) {
  const publicacion = await this.publicacionModel.findById(publicacionId);
  if (!publicacion) throw new NotFoundException('Publicación no encontrada');

  const yaDioLike = publicacion.usuariosQueDieronLike.includes(usuarioId);
  const yaDioDislike = publicacion.usuariosQueDieronDislike.includes(usuarioId);

  if (yaDioLike) {
    // Si ya le dio like, se lo sacamos (Toggle)
    return await this.publicacionModel.findByIdAndUpdate(
      publicacionId,
      { $pull: { usuariosQueDieronLike: usuarioId } },
      { new: true }
    );
  } else {
    // Si no le dio like, lo agregamos y nos aseguramos de sacarlo de dislike si existía
    return await this.publicacionModel.findByIdAndUpdate(
      publicacionId,
      {
        $addToSet: { usuariosQueDieronLike: usuarioId },
        $pull: { usuariosQueDieronDislike: usuarioId }
      },
      { new: true }
    );
  }
}

// 🛸 DAR/QUITAR DISLIKE
async darDislike(publicacionId: string, usuarioId: string) {
  const publicacion = await this.publicacionModel.findById(publicacionId);
  if (!publicacion) throw new NotFoundException('Publicación no encontrada');

  const yaDioLike = publicacion.usuariosQueDieronLike.includes(usuarioId);
  const yaDioDislike = publicacion.usuariosQueDieronDislike.includes(usuarioId);

  if (yaDioDislike) {
    // Si ya tiene dislike, se lo quitamos
    return await this.publicacionModel.findByIdAndUpdate(
      publicacionId,
      { $pull: { usuariosQueDieronDislike: usuarioId } },
      { new: true }
    );
  } else {
    // Si no tiene, lo agregamos a dislike y lo removemos de likes
    return await this.publicacionModel.findByIdAndUpdate(
      publicacionId,
      {
        $addToSet: { usuariosQueDieronDislike: usuarioId },
        $pull: { usuariosQueDieronLike: usuarioId }
      },
      { new: true }
    );
  }
}

}