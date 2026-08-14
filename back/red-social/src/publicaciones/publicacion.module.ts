import { Module } from '@nestjs/common';
import {  PublicacionService } from './publicacion.service';
import { PublicacionController } from './publicacion.controller';
import { Publicacion, PublicacionSchema } from './publicacion.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuarioSchema, Usuario } from 'src/usuarios/usuario.schema';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';



@Module({
    imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Usuario.name, schema: UsuarioSchema }, // 👈 ¡DEBE FIGURAR ACÁ SÍ O SÍ!
    ]),
    NotificacionesModule,
  ],
    exports: [PublicacionService],
    controllers: [PublicacionController],
    providers: [PublicacionService],
})
export class PublicacionModule { }
