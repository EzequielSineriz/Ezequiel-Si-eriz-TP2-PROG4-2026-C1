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
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    // 🛡️ Límite: Máximo 60 peticiones por minuto por IP
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),



    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // Ruta pública de la API
    }),
    
    UsuarioModule,
    AuthModule,
    PublicacionModule,
    ComentarioModule,
    EstadisticasModule,
    NotificacionesModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Aplica el rate limiting globalmente
    },
  ],
})
export class AppModule {
  
}
