import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-navbar-superior',
  imports: [],
  templateUrl: './navbar-superior.html',
  styleUrl: './navbar-superior.css',
})
export class NavbarSuperior {
  public authService = inject(AuthService);

  get currentUser() {
    const rawUser = this.authService.usuarioActual();
    if (!rawUser) return null;
    return rawUser.user ? rawUser.user : rawUser;
  }
}
