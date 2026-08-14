import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notificaciones.gateway';

@Module({
  providers: [NotificationsGateway],
  exports: [NotificationsGateway], // Exportamos para inyectarlo en PublicacionService / ComentarioService
})
export class NotificacionesModule {}