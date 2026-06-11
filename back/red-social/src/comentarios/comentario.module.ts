import { MongooseModule } from "@nestjs/mongoose";
import { Publicacion, PublicacionSchema } from "src/publicaciones/publicacion.schema";
import { ComentarioController } from "./comentario.controller";
import { ComentarioService } from "./comentario.service";
import { Module } from "@nestjs/common";
import { Comentario, ComentarioSchema } from "./comentarios.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
        {   name: Comentario.name, schema: ComentarioSchema },
        {   name: Publicacion.name, schema: PublicacionSchema }
        ]),
    ],
    exports: [],
    controllers: [ComentarioController],
    providers: [ComentarioService],
})
export class ComentarioModule { }
