import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema({timestamps: true})
export class Comentario extends Document {
    @Prop({ required: true, maxlength: 300 })
  contenido!: string;

  // Vinculación con el investigador que comenta
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  autorId!: string;

  // Vinculación con la publicación a la que pertenece
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Publicacion', required: true })
  publicacionId!: string;

  // Sistema de reacciones espectrales
  @Prop({ default: 0 })
  likes!: number;

  @Prop({ default: [] })
  usuariosQueDieronLike!: string[];

  @Prop({ default: [] })
  usuariosQueDieronDislike!: string[];

  @Prop({ default: false })
  eliminado!: boolean; // Borrado lógico para comentarios

    @Prop({ default: false })
    modificado?: boolean;

    @Prop()
    fechaModificacion?: Date;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);