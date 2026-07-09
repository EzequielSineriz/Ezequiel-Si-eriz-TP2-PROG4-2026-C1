import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ImagenMediaPipe } from '../../../utils/pipes/imagen.media.pipe';
import {LucideSmile} from "@lucide/angular";




@Component({
  selector: 'app-aside-izquierdo',
  imports: [RouterLink,RouterLinkActive, ImagenMediaPipe, LucideSmile],
  templateUrl: './aside-izquierdo.html',
  styleUrl: './aside-izquierdo.css',
})
export class AsideIzquierdo implements AfterViewInit {
  public menuItems = [
    { icon: 'bi bi-house-door-fill', label: 'Inicio', active: true },
    { icon: 'bi bi-hash', label: 'Explorar', active: false },
    { icon: 'bi bi-bell', label: 'Notificaciones', active: false },
    { icon: 'bi bi-envelope', label: 'Mensajes', active: false },
    { icon: 'bi bi-bookmark', label: 'Guardados', active: false },
    { icon: 'bi bi-person', label: 'Perfil', active: false },
  ];

  public authService = inject(AuthService);

  public audioMutado = signal<boolean>(false);

  @ViewChild('reproductorLluvia') reproductorLluvia!: ElementRef<HTMLAudioElement>;

  get currentUser() {
    const rawUser = this.authService.usuarioActual();
    if (!rawUser) return null;
    return rawUser.user ? rawUser.user : rawUser;
  }

  ngAfterViewInit(): void {
    if (this.reproductorLluvia) {
      const audio = this.reproductorLluvia.nativeElement;
      audio.volume = 0.15; // Mantener volumen sutil de fondo
      audio.play().catch(error => {
        console.log('[AUDIO] Autoplay bloqueado por políticas del navegador.', error);
      });
    }
  }

  alternarSilencioAudio(): void {
    if (!this.reproductorLluvia) return;
    const audio = this.reproductorLluvia.nativeElement;
    this.audioMutado.update(estado => !estado);
    audio.muted = this.audioMutado();
  }


}
