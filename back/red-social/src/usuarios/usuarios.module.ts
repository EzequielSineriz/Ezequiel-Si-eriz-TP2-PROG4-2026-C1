import { Module } from "@nestjs/common";
import { Usuario, UsuarioSchema } from "./usuario.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { UsuariosController } from "./usuario.controller";
import { UsuariosService } from "./usuario.service";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    ],
    controllers: [UsuariosController],
    exports: [],
    providers: [UsuariosService],
})
export class UsuarioModule { }
