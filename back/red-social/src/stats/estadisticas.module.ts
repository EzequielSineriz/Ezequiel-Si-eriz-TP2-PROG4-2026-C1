import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EstadisticasService } from './estadisticas.service';
import { Publicacion, PublicacionSchema } from 'src/publicaciones/publicacion.schema'; // Ajustá las rutas a tus schemas
import { Usuario, UsuarioSchema } from 'src/usuarios/usuario.schema';
import { EstadisticasController } from './estadisticas.controller';

@Module({
  imports: [
    // 🧬 Inyectamos los modelos existentes para que el servicio de estadísticas pueda consultarlos
    MongooseModule.forFeature([
    { name: Publicacion.name, schema: PublicacionSchema },
    { name: Usuario.name, schema: UsuarioSchema },
  ]),
  ],
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
})
export class EstadisticasModule {}