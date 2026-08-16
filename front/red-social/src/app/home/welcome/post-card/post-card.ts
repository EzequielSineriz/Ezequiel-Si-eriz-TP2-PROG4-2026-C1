import { Component, EventEmitter, inject, input, Output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPublicacion } from '../../publicaciones/interfaces/publicaciones.interface';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { ImagenMediaPipe } from '../../../utils/pipes/imagen.media.pipe';
import { PostMioEstiloDirective } from '../../../utils/directives/post-mio-estilo';
import { PostCategoriaEstiloDirective } from '../../../utils/directives/post-categoria-estilo';
import { TiempoEspectralPipe } from '../../../utils/pipes/tiempo-comentario.pipe';
import { ScaryMythIconComponent } from '../../../utils/icons/mytology_icons';
import { ScaryUfoIconComponent } from '../../../utils/icons/ovni_icons';
import { ScaryGeneralIconComponent } from '../../../utils/icons/pergamino_icons';
import { ScaryGhostIcon } from '../../../utils/icons/ghost_icon';
import { ScaryTrashIconComponent } from '../../../utils/icons/basura_icons';
import { ScaryCommentIconComponent } from '../../../utils/icons/comentarios_icons';
import { ScaryHeartIconComponent } from '../../../utils/icons/corazon_icons';

@Component({
  selector: 'app-post-card',
  imports: [
    CommonModule,
    ImagenMediaPipe,
    PostMioEstiloDirective,
    PostCategoriaEstiloDirective,
    TiempoEspectralPipe,
    ScaryUfoIconComponent,
    ScaryGhostIcon,
    ScaryMythIconComponent,
    ScaryGeneralIconComponent,
    ScaryCommentIconComponent,
    ScaryHeartIconComponent,
    ScaryTrashIconComponent
  ],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  // ⚡ Inputs transformados a Signals
  post = input.required<IPublicacion>();
  usuarioActualId = input.required<string>();

  @Output() onLike = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();

  private router = inject(Router);
  public authService = inject(AuthService);
  public publicacionesService = inject(PublicacionesService);

  // 🧠 Signals Derivados (Computed)
  esMiPost = computed(() => {
    const p = this.post();
    const uId = this.usuarioActualId();
    if (!p || !p.autorId || !uId) return false;

    const idDelAutor = typeof p.autorId === 'object' ? p.autorId._id : p.autorId;
    return String(idDelAutor).trim() === String(uId).trim();
  });

  leDioLike = computed(() => {
    const p = this.post();
    const uId = this.usuarioActualId();
    return p.usuariosQueDieronLike?.includes(uId) || false;
  });

  cantidadComentarios = computed(() => {
    return this.post().comentarios?.length || 0;
  });

  obtenerNombreAutor(): string {
    const autor = this.post().autorId;
    if (typeof autor === 'object' && autor !== null) {
      return autor.nombreUsuario || 'Investigador';
    }
    return 'Investigador Anónimo';
  }

  confirmarEliminacion() {
    this.desplegarAlertaConfirmacion(
      '¿Destruir Evidencia?',
      'Esta acción borrará el registro del plano terrenal de forma permanente.'
    );
  }

  irAlDetalle(event: Event) {
    const target = event.target as HTMLElement;
    if (target.closest('.no-redirect')) return;

    this.router.navigate(['/home/publicaciones', this.post()._id]);
  }

  confirmarPurgaPublicacion() {
    this.desplegarAlertaConfirmacion(
      '¿PURGAR REGISTRO DEL NEXO?',
      'Esta acción purgará la publicación y todos sus comentarios del registro histórico de forma administrativa.'
    );
  }

  private desplegarAlertaConfirmacion(titulo: string, subitulo: string) {
    Swal.fire({
      title: `<span class="font-logo uppercase tracking-widest text-xl text-red-600">${titulo}</span>`,
      html: `<span class="font-body text-sm text-gray-300">${subitulo}</span>`,
      icon: 'warning',
      showCancelButton: true,
      background: '#1a1a1a',
      color: '#e0e0e0',
      confirmButtonColor: '#a30000',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'SÍ, PURGAR',
      cancelButtonText: 'CONSERVAR',
      iconColor: '#a30000'
    }).then((result) => {
      if (result.isConfirmed) {
        this.onDelete.emit();
      }
    });
  }
}
