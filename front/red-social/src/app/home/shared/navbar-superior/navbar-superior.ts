import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { ImagenMediaPipe } from '../../../utils/pipes/imagen.media.pipe';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../notifications/web-sockets-service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-navbar-superior',
  imports: [ImagenMediaPipe, RouterLink, DatePipe],
  templateUrl: './navbar-superior.html',
  styleUrl: './navbar-superior.css',
})
export class NavbarSuperior implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  private notifSub!: Subscription;

  notificaciones: any[] = [];
  mostrarDropdown: boolean = false;
  notificacionesNoLeidas: number = 0;

  constructor(private wsService: WebSocketService) {}

  ngOnInit(): void {
    const miUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (miUsuario._id) {
      this.wsService.unirseASalaPrivada(miUsuario._id);
    }

    this.notifSub = this.wsService.onNuevaNotificacion().subscribe({
      next: (data) => {
        console.log('🔔 ¡Nueva notificación recibida!:', data);

        // Asignar fecha actual si no viene del backend
        const notif = { ...data, fecha: data.fecha || new Date() };

        this.notificaciones.unshift(notif);
        this.notificacionesNoLeidas++;
      }
    });
  }

  toggleDropdownNotificaciones(): void {
    this.mostrarDropdown = !this.mostrarDropdown;

    // Al abrir la campana marcamos todas como leídas (reseteamos el contador)
    if (this.mostrarDropdown) {
      this.notificacionesNoLeidas = 0;
    }
  }

  limpiarNotificaciones(): void {
    this.notificaciones = [];
    this.notificacionesNoLeidas = 0;
  }

  ngOnDestroy(): void {
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }
  }

  get currentUser() {
    const rawUser = this.authService.usuarioActual();
    if (!rawUser) return null;
    return rawUser.user ? rawUser.user : rawUser;
  }
}
