import { Module } from '@nestjs/common';
import { NotificacionesGateway } from './notificaciones.gateway';

@Module({
  providers: [NotificacionesGateway],
  exports: [NotificacionesGateway], // Exportamos para inyectarlo en PublicacionService / ComentarioService
})
export class NotificacionesModule {}