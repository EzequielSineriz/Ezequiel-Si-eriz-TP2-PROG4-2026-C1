import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { UsuarioModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { PublicacionModule } from './publicaciones/publicacion.module';
import { ComentarioModule } from './comentarios/comentario.module';
import { EstadisticasModule } from './stats/estadisticas.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb+srv://ezequielsineriz_db_user:FpAhkyrpO0mddc5h@cluster0.k9mhhz0.mongodb.net/red-social?appName=Cluster0'),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // Ruta pública de la API
    }),
    UsuarioModule,
    AuthModule,
    PublicacionModule,
    ComentarioModule,
    UsuarioModule,
    EstadisticasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
