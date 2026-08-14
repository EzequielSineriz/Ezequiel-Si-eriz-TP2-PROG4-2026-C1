import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificacionesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server; // 👈 Agregamos el signo ! acá

  handleConnection(client: Socket) {
    console.log(`⚡ Cliente conectado al plano espectral: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`💀 Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('unirseASala')
  handleUnirseASala(
    @MessageBody() usuarioId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(usuarioId);
    return { status: 'Unido con éxito a la sala personal' };
  }

  // 🔔 Notificación de Me Gusta (Like)
  notificarLike(destinoUsuarioId: string, emisorNombre: string, publicacionId: string) {
    this.server.to(destinoUsuarioId).emit('notificacion', {
      tipo: 'LIKE',
      mensaje: `A @${emisorNombre} le gustó tu publicación`,
      publicacionId,
      fecha: new Date(),
    });
  }

  // 💬 Notificación de Comentario
  notificarComentario(destinoUsuarioId: string, emisorNombre: string, publicacionId: string) {
    this.server.to(destinoUsuarioId).emit('notificacion', {
      tipo: 'COMENTARIO',
      mensaje: `@${emisorNombre} comentó tu publicación`,
      publicacionId,
      fecha: new Date(),
    });
  }

  // 📢 Notificación Global de Nueva Publicación
  notificarNuevaPublicacion(publicacion: any) {
    this.server.emit('nuevaPublicacion', publicacion);
  }
}