import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, input, Output } from '@angular/core';
import { IPublicacion } from '../../publicaciones/publicaciones.interface';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {

@Input({ required: true }) post!: IPublicacion;
  @Input({ required: true }) usuarioActualId: string = '';
  @Output() onLike = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();




  private router = inject(Router);


obtenerNombreAutor(): string {
  if (typeof this.post.autorId === 'object') {
    return this.post.autorId.nombreUsuario || 'Investigador';
  }
  return 'Investigador Anónimo';
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
    Swal.fire({
      title: '<span class="font-logo uppercase tracking-widest text-xl text-red-600">¿Destruir Evidencia?</span>',
      html: '<span class="font-body text-sm text-gray-300">Esta acción borrará el registro del plano terrenal de forma permanente.</span>',
      icon: 'warning',
      showCancelButton: true,
      background: '#1a1a1a', // Fondo oscuro de tu carta
      color: '#e0e0e0',
      confirmButtonColor: '#a30000', // Rojo sangre
      cancelButtonColor: '#3f3f46',  // Gris zinc
      confirmButtonText: 'SÍ, BORRAR',
      cancelButtonText: 'CONSERVAR',
      iconColor: '#a30000',
      customClass: {
        popup: 'border border-red-900/40 shadow-[0_0_15px_rgba(163,0,0,0.3)] rounded-md',
        confirmButton: 'font-body uppercase tracking-wider font-bold px-4 py-2 rounded text-xs cursor-pointer',
        cancelButton: 'font-body uppercase tracking-wider font-bold px-4 py-2 rounded text-xs cursor-pointer'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario acepta, disparamos el evento hacia el feed para impactar la API
        this.onDelete.emit();
      }
    });
  }

  irAlDetalle(event: Event) {
  //  Evitamos que haga la redirección si el usuario hace clic en los botones de Like o Eliminar
  const target = event.target as HTMLElement;
  if (target.closest('.no-redirect')) {
    return;
  }

  this.router.navigate(['/home/publicaciones', this.post._id]);
}

}
