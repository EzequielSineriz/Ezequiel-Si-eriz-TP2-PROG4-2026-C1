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
    exports: [UsuariosService], // Exportamos el servicio para que pueda ser inyectado en otros módulos (como AuthModule)
    providers: [UsuariosService],
})
export class UsuarioModule { }
