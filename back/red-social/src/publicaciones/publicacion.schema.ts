
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Schema as MongooseSchema } from "mongoose";

@Schema({ timestamps: true }) 
export class Publicacion {
    @Prop({ required: true })
    contenido!: string;


    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
    autorId!: string; // ID del usuario que creó la publicación

    @Prop()
    imagenUrl?: string; // URL de la imagen asociada a la publicación (opcional)+

    @Prop({ required: true, enum: ['fantasmas', 'ovnis', 'mitologia', 'general'], default: 'general' })
    categoria!: string;

    @Prop({ default: [] })
    comentarios!: string[]; // Lista de comentarios asociados a la publicación

    @Prop({ default: 0 })
    likes!: number; // Contador de "me gusta" para la publicación

    @Prop({ default: [] })
    etiquetas!: string[]; // Lista de etiquetas asociadas a la publicación


    @Prop({ default: false })
    eliminada!: boolean; // Indica si la publicación ha sido eliminada

    
    @Prop({ default: [] })
    usuariosQueDieronLike!: string[];

    @Prop({ default: [] })
    usuariosQueDieronDislike!: string[]; 


}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);