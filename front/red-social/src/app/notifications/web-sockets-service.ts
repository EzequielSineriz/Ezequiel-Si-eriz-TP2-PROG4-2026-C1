import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.apiUrl); // Se conecta al puerto 3000 o URL de Render
  }

  // Escuchar cuando entra un nuevo post
  onNuevaPublicacion(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('nuevaPublicacion', (data) => observer.next(data));
    });
  }

  // Unirse al canal privado del usuario logueado
  unirseASalaPrivada(usuarioId: string) {
    this.socket.emit('unirseASala', usuarioId);
  }
}
