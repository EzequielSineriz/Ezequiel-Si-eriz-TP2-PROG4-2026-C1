import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { IPublicacion } from '../../publicaciones/publicaciones.interface';
import { PublicacionesService } from '../../publicaciones/publicaciones.service';
import { PostCard } from "../post-card/post-card";
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-profile',
  imports: [CommonModule, PostCard,FormsModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css',
})
export class MyProfile implements OnInit {


  public authService = inject(AuthService);
  private pubService = inject(PublicacionesService);

  // Signals reactivos para las métricas analíticas del perfil
  public ultimosPosteos = signal<IPublicacion[]>([]);
  public totalPublicaciones = signal<number>(0);
  public meGustasTotales = signal<number>(0);
  public cargandoBitacora = signal<boolean>(true);

  public editandoDescripcion = signal<boolean>(false);
  public descripcionTemporal = '';

  // Getter reactivo usando la señal del usuario logueado
  get currentUser() {
    const rawUser = this.authService.usuarioActual();
    if (!rawUser) return null;
    return rawUser.user ? rawUser.user : rawUser;
  }

  constructor() {
    effect(() => {
      const usuario = this.currentUser;
      if (usuario && usuario._id) {
        this.cargarMetricas();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const usuario = this.currentUser;

    if (usuario && usuario._id) {
      this.cargarMetricas();
    } else {
      // Por si el guard tardó un milisegundo más en rellenar la señal
      console.warn('Sincronizando credenciales tardías de la orden...');
      this.cargandoBitacora.set(false);
    }
  }

  cargarMetricas() {
    if (!this.cargandoBitacora()) return;

    this.pubService.obtenerMetricasPerfil().subscribe({
      next: (data) => {
        this.ultimosPosteos.set(data.ultimasPublicaciones);
        this.totalPublicaciones.set(data.totalPublicaciones);
        this.meGustasTotales.set(data.meGustasTotales);
        this.cargandoBitacora.set(false);
      },
      error: (err) => {
        console.error('Error al sintonizar la bitácora:', err);
        this.cargandoBitacora.set(false);
      }
    });
  }

  alternarLikePostPadre(publicacionId: string) {
  this.pubService.darLike(publicacionId).subscribe({
    next: (postActualizado) => {
      // Buscamos el post viejo en el array de ultimosPosteos y lo reemplazamos por el actualizado de la BD
      this.ultimosPosteos.update(lista =>
        lista.map(p => p._id === publicacionId ? postActualizado : p)
      );
    },
    error: (err) => console.error('Error al registrar la reacción paranormal:', err)
  });
}

activarEdicionDescripcion() {
  this.descripcionTemporal = this.currentUser?.descripcion || '';
  this.editandoDescripcion.set(true);
}

guardarDescripcion() {
  if (!this.currentUser) return;

  this.authService.actualizarPerfilUsuario(this.currentUser._id, this.descripcionTemporal, null).subscribe({
    next: () => {
      this.editandoDescripcion.set(false);
      Swal.fire({
        toast: true, position: 'top-end', icon: 'success', title: 'Bitácora descriptiva actualizada',
        showConfirmButton: false, timer: 1500, background: '#0d0d0d', color: '#10b981'
      });
    }
  });
}

cancelarEdicionDescripcion() {
  this.editandoDescripcion.set(false);
}

onAvatarSeleccionado(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0 && this.currentUser) {
    const archivo = input.files[0];

    // Mostramos un loader rápido para avisar que se está procesando en la logia
    this.cargandoBitacora.set(true);

    this.authService.actualizarPerfilUsuario(this.currentUser._id, this.currentUser.descripcion || '', archivo).subscribe({
      next: () => {
        this.cargandoBitacora.set(false);
        Swal.fire({
          toast: true, position: 'top-end', icon: 'success', title: 'Identidad espectral reconfigurada',
          showConfirmButton: false, timer: 1500, background: '#0d0d0d', color: '#10b981'
        });
      },
      error: () => this.cargandoBitacora.set(false)
    });
  }
}




}
