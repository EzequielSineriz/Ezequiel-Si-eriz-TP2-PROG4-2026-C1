import {  Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

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

  @Prop()
  descripcion!: string;

  @Prop()
  avatarUrl!: string; // URL de la imagen guardada

  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil!: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
