import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImagenMediaPipe } from '../utils/pipes/imagen.media.pipe';
import { INotificacion } from './notification.interface';


@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, ImagenMediaPipe, RouterLink],
  templateUrl: 'notification-dropdown.html',
  //styleUrl: './notification-dropdown.css',
})
export class NotificationDropdown {
  // Entradas y Salidas
  notificaciones = input<INotificacion[]>([]);
  limpiar = output<void>();
  seleccionarNotificacion = output<INotificacion>();

  // Agrupamiento computado por tiempo (Hoy, Esta Semana, Anteriores)
  notificacionesAgrupadas = computed(() => {
    const lista = this.notificaciones();
    const hoy: INotificacion[] = [];
    const estaSemana: INotificacion[] = [];
    const anteriores: INotificacion[] = [];

    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const haceSieteDias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

    lista.forEach(n => {
      const fechaNotif = new Date(n.fecha);
      if (fechaNotif >= inicioHoy) {
        hoy.push(n);
      } else if (fechaNotif >= haceSieteDias) {
        estaSemana.push(n);
      } else {
        anteriores.push(n);
      }
    });

    return { hoy, estaSemana, anteriores };
  });

  // Formateador de tiempo estilo "1 d", "3 d", "12 h"
  tiempoRelativo(fechaRaw: Date | string): string {
    const fecha = new Date(fechaRaw);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);

    if (diffHoras < 1) return 'ahora';
    if (diffHoras < 24) return `${diffHoras} h`;
    if (diffDias < 30) return `${diffDias} d`;
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  }
}
