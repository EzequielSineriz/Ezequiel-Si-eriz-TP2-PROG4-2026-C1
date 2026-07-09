import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, input, Output } from '@angular/core';
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
  imports: [CommonModule,
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
  templateUrl:'./post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {

  @Input({ required: true }) post!: IPublicacion;
  @Input({ required: true }) usuarioActualId: string = '';
  @Output() onLike = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();


  private router = inject(Router);

  public authService = inject(AuthService);

  public publicacionesService = inject(PublicacionesService);


  obtenerNombreAutor(): string {
    if (typeof this.post.autorId === 'object') {
      return this.post.autorId.nombreUsuario || 'Investigador';
    }
    return 'Investigador Anónimo';
  }

  obtenerAvatarAutor(): string {
    if (typeof this.post.autorId === 'object' && this.post.autorId.avatarUrl) {
      return this.post.autorId.avatarUrl;
    }
    // Retornamos un string vacío o null si no existe, para que el HTML use el fallback de tu Pipe
    return '';
  }



  get esMiPost(): boolean {
    if (!this.post || !this.post.autorId || !this.usuarioActualId) return false;

    // 1. Extraemos el ID del autor de forma segura
    const idDelAutor = typeof this.post.autorId === 'object'
      ? this.post.autorId._id
      : this.post.autorId;

    // 2. Comparamos asegurándonos de que ambos sean strings limpios
    return String(idDelAutor).trim() === String(this.usuarioActualId).trim();
  }

  get leDioLike(): boolean {
    return this.post.usuariosQueDieronLike?.includes(this.usuarioActualId) || false;
  }

  // 🩸 Alerta personalizada gótica para confirmar la destrucción del registro
  confirmarEliminacion() {
    this.desplegarAlertaConfirmacion(
      '¿Destruir Evidencia?',
      'Esta acción borrará el registro del plano terrenal de forma permanente.'
    );
  }

  irAlDetalle(event: Event) {
  //  Evitamos que haga la redirección si el usuario hace clic en los botones de Like o Eliminar
  const target = event.target as HTMLElement;
  if (target.closest('.no-redirect')) {
    return;
  }

  this.router.navigate(['/home/publicaciones', this.post._id]);
}

confirmarPurgaPublicacion() {
    this.desplegarAlertaConfirmacion(
      '¿PURGAR REGISTRO DEL NEXO?',
      'Esta acción purgará la publicación y todos sus comentarios del registro histórico de forma administrativa.');
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
        // Le avisamos al feed que borre este post en particular
        this.onDelete.emit();
      }
    });
  }

}
