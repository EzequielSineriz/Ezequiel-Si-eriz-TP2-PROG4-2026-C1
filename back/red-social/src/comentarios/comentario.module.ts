import { MongooseModule } from "@nestjs/mongoose";
import { Publicacion, PublicacionSchema } from "src/publicaciones/publicacion.schema";
import { ComentarioController } from "./comentario.controller";
import { ComentarioService } from "./comentario.service";
import { Module } from "@nestjs/common";
import { Comentario, ComentarioSchema } from "./comentarios.schema";
import { NotificacionesModule } from "src/notificaciones/notificaciones.module";

@Module({
    imports: [
        MongooseModule.forFeature([
        {   name: Comentario.name, schema: ComentarioSchema },
        {   name: Publicacion.name, schema: PublicacionSchema }
        ]),
        NotificacionesModule
    ],
    exports: [],
    controllers: [ComentarioController],
    providers: [ComentarioService],
})
export class ComentarioModule { }
