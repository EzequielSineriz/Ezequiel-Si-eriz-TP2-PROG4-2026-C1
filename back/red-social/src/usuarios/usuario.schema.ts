import {  Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class Usuario {
  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true })
  apellido!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true, unique: true })
  nombreUsuario!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  fechaNacimiento!: Date;

  @Prop({ default: 'Buscador de las verdades ocultas en las sombras.' })
  descripcion!: string;

  @Prop()
  avatarUrl!: string; // URL de la imagen guardada

  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  seguidores!: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  siguiendo!: Types.ObjectId[];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
