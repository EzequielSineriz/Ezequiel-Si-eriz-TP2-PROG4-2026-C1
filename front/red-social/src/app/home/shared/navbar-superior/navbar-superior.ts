import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
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

  notificaciones = signal<any[]>([]);           // 👈 antes: notificaciones: any[] = [];
  notificacionesNoLeidas = signal<number>(0);    // 👈 antes: notificacionesNoLeidas: number = 0;
  mostrarDropdown: boolean = false;

  private usuarioUnidoALaSala: string | null = null; // evita unirse dos veces al mismo usuario

  constructor(private wsService: WebSocketService) {
    // Reacciona cada vez que el signal cambia: al loguearte, al recargar con
    // sesión ya iniciada, o al hacer logout (usuario pasa a null).
    effect(() => {
      const usuario = this.authService.usuarioActual();
      if (usuario?._id && this.usuarioUnidoALaSala !== usuario._id) {
        this.wsService.unirseASalaPrivada(usuario._id);
        this.usuarioUnidoALaSala = usuario._id;
      }
    });
  }

  ngOnInit(): void {
    this.notifSub = this.wsService.onNuevaNotificacion().subscribe({
      next: (data) => {
        const notif = { ...data, fecha: data.fecha || new Date() };
        this.notificaciones.update(actuales => [notif, ...actuales]); // 👈 .update() en vez de .unshift()
        this.notificacionesNoLeidas.update(n => n + 1);
      }
    });
  }

  toggleDropdownNotificaciones(): void {
    this.mostrarDropdown = !this.mostrarDropdown;
    if (this.mostrarDropdown) {
      this.notificacionesNoLeidas.update(n => 0);
    }
  }

  limpiarNotificaciones(): void {
    this.notificaciones.set([]);
    this.notificacionesNoLeidas.update(n => 0);
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
