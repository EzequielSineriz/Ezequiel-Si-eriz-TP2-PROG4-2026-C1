import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 👈 Inyectamos ConfigService
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { PublicacionModule } from './publicaciones/publicacion.module';
import { ComentarioModule } from './comentarios/comentario.module';
import { EstadisticasModule } from './stats/estadisticas.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

@Module({
  imports: [
    // ⚙️ Carga global de variables de entorno desde .env
    ConfigModule.forRoot({ isGlobal: true }),

    // 🍃 Conexión asíncrona a MongoDB Atlas garantizando la lectura previa del .env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        if (!uri) {
          throw new Error('❌ La variable MONGO_URI no está definida en el archivo .env');
        }
        return { uri };
      },
    }),

    // 🛡️ Rate Limiting: Máximo 60 peticiones por minuto por IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),

    // 📂 Archivos estáticos (Uploads)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // 📦 Módulos del Dominio
    UsuarioModule,
    AuthModule,
    PublicacionModule,
    ComentarioModule,
    EstadisticasModule,
    NotificacionesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}