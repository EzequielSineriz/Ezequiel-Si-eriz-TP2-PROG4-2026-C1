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
    const token = localStorage.getItem('paranormal_token');

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

  // 1. Unirse a la sala privada del usuario
  unirseASalaPrivada(usuarioId: string): void {
    if (usuarioId) {
      this.socket.emit('unirseASala', usuarioId);
    }
  }

  // 2. Escuchar Notificaciones Privadas (Campanita de Likes, Menciones, etc.)
  onNuevaNotificacion(): Observable<any> {
    return new Observable((observer) => {
      const handler = (data: any) => observer.next(data);
      this.socket.on('nuevaNotificacion', handler);

      return () => {
        this.socket.off('nuevaNotificacion', handler);
      };
    });
  }

  // 3. Escuchar Eventos Globales de Publicaciones (Nuevas, Likes y Ediciones)
  onPublicacionActualizada(): Observable<any> {
    return new Observable((observer) => {
      const handler = (data: any) => observer.next(data);
      this.socket.on('publicacionActualizada', handler);

      return () => {
        this.socket.off('publicacionActualizada', handler);
      };
    });
  }

  // 4. Desconectar al cerrar sesión
  desconectar(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
