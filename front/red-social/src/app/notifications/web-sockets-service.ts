import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/enviroment.development';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket;

  constructor() {
    const token = localStorage.getItem('paranormal_token'); // Recuperamos el JWT

    // Conectamos pasando el token en el handshake de Socket.IO
    this.socket = io(environment.apiUrl, {
      auth: {
        token: token ? `Bearer ${token}` : '',
      },
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('⚡ Conectado a WebSockets:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WS:', error.message);
    });
  }

  // 1. Unirse a la sala privada del usuario (si tu backend lo requiere manualmente)
  unirseASalaPrivada(usuarioId: string): void {
    if (usuarioId) {
      this.socket.emit('unirseASala', usuarioId);
    }
  }

  // 2. Escuchar Notificaciones en Tiempo Real (Likes, Comentarios, etc.)
  onNuevaNotificacion(): Observable<any> {
    return new Observable((observer) => {
      const handler = (data: any) => observer.next(data);

      this.socket.on('nuevaNotificacion', handler);

      // Limpieza cuando el componente se destruye / se desuscribe
      return () => {
        this.socket.off('nuevaNotificacion', handler);
      };
    });
  }

  // 3. Escuchar cuando alguien crea una publicación en el feed global
  onNuevaPublicacion(): Observable<any> {
    return new Observable((observer) => {
      const handler = (data: any) => observer.next(data);

      this.socket.on('nuevaPublicacion', handler);

      return () => {
        this.socket.off('nuevaPublicacion', handler);
      };
    });
  }

  // 4. Método utilitario para desconectar si hace Logout
  desconectar(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
