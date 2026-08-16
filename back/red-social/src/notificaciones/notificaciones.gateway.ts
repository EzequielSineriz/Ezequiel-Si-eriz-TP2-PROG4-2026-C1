import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('unirseASala')
  handleUnirseASala(
    @MessageBody() usuarioId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (usuarioId) {
      const idLimpio = String(usuarioId).trim();
      client.join(idLimpio);
      console.log(`👤 Socket ${client.id} se unió a la sala privada: ${idLimpio}`);
    }
  }

  // Notificación privada (campana/alertas individuales)
  notificarUsuario(usuarioIdDestino: string, payload: any) {
    const idLimpio = String(usuarioIdDestino).trim();
    const salaExiste = this.server.sockets.adapter.rooms.has(idLimpio);
    console.log(`📤 Notificación a usuario "${idLimpio}" — ¿conectado?:`, salaExiste);
    this.server.to(idLimpio).emit('nuevaNotificacion', payload);
  }

  // Actualización pública global (feed de publicaciones/likes/comentarios)
  emitirPublicacionActualizada(postActualizado: any) {
    console.log(`📡 Emitiendo 'publicacionActualizada' globalmente para el post: ${postActualizado._id}`);
    this.server.emit('publicacionActualizada', postActualizado);
  }
}