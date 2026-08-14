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
    origin: '*', // O tu URL de Angular
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

  // 🎯 AQUÍ OCURRE LA MAGIA: El cliente le dice al server cuál es su Mongo _id
  @SubscribeMessage('unirseASala')
  handleUnirseASala(
    @MessageBody() usuarioId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (usuarioId) {
      client.join(usuarioId); // Mete la conexión en la sala con el ID de Mongo
      console.log(`👤 Socket ${client.id} se unió a la sala privada: ${usuarioId}`);
    }
  }

  // Método helper para emitir directamente a un usuario
  notificarUsuario(usuarioIdDestino: string, payload: any) {
    this.server.to(usuarioIdDestino).emit('nuevaNotificacion', payload);
  }
}