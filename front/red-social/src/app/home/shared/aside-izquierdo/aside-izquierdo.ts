import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-aside-izquierdo',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './aside-izquierdo.html',
  styleUrl: './aside-izquierdo.css',
})
export class AsideIzquierdo {
  public menuItems = [
    { icon: 'bi bi-house-door-fill', label: 'Inicio', active: true },
    { icon: 'bi bi-hash', label: 'Explorar', active: false },
    { icon: 'bi bi-bell', label: 'Notificaciones', active: false },
    { icon: 'bi bi-envelope', label: 'Mensajes', active: false },
    { icon: 'bi bi-bookmark', label: 'Guardados', active: false },
    { icon: 'bi bi-person', label: 'Perfil', active: false },
  ];

  public authService = inject(AuthService);

  get currentUser() {
    const rawUser = this.authService.usuarioActual();
    if (!rawUser) return null;
    return rawUser.user ? rawUser.user : rawUser;
  }
}
