import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { EspectroComentariosPipe } from '../../utils/pipes/comentarios-count.pipe';
import { IComentario } from './comentarios/comentarios.interfaces';
import { ComentariosService } from './comentarios/comentarios.service';
import { IPublicacion } from './interfaces/publicaciones.interface';
import { PublicacionesService } from './service/publicaciones.service';
import { AuthService } from '../../auth/services/auth.service';
import { ImagenMediaPipe } from '../../utils/pipes/imagen.media.pipe';
import { CensuraParanormalPipe } from '../../utils/pipes/palabras-censuradas.pipe';
import { PostCategoriaEstiloDirective } from '../../utils/directives/post-categoria-estilo';
import { ScaryCommentIconComponent } from '../../utils/icons/comentarios_icons';
import { ScaryHeartIconComponent } from '../../utils/icons/corazon_icons';

@Component({
  selector: 'app-publicacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ImagenMediaPipe,
    PostCategoriaEstiloDirective,
    ScaryCommentIconComponent,
    ScaryHeartIconComponent,
    CensuraParanormalPipe, // 👈 Agregar aquí
    EspectroComentariosPipe, // 👈 Agregar aquí
],
  templateUrl: './publicacion.component.html',
})
export class DetallePublicacionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public pubService = inject(PublicacionesService);
  private comentarioService = inject(ComentariosService);
  public authService = inject(AuthService);
  private router = inject(Router);

  public post = signal<IPublicacion | null>(null);
  public comentarios = signal<IComentario[]>([]);
  public nuevoComentarioTexto = '';
  public usuarioLogueadoId = '';

  public comentarioEditandoId: string | null = null;
  public textoEdicionTemporal: string = '';



  ngOnInit(): void {
    // 1. Obtener ID del usuario de la sesión para Likes y Borrado
    const userJson = localStorage.getItem('paranormal_user');
    if (userJson) {
      this.usuarioLogueadoId = JSON.parse(userJson)._id;
    }

    // 2. Capturar el ID espectral de la ruta de Angular
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.cargarPostYComentarios(postId);
    }
  }



  public leDioLikeAlPost = computed(() => {
  const p = this.post();
  if (!p || !p.usuariosQueDieronLike) return false;

  // Devuelve true si nuestro ID está en la lista de linces que dieron me gusta
  return p.usuariosQueDieronLike.includes(this.usuarioLogueadoId);
});

  cargarPostYComentarios(id: string) {
    // Traer la publicación original
    this.pubService.obtenerPublicacionPorId(id).subscribe({
      next: (data) => this.post.set(data),
      error: (err) => console.error('Error invocando el registro base:', err)
    });

    // Traer la lista de debates asociados
    this.comentarioService.obtenerPorPublicacion(id).subscribe({
      next: (data) => this.comentarios.set(data),
      error: (err) => console.error('Error invocando el hilo de comentarios:', err)
    });
  }

  // Agregá este método dentro de tu clase DetallePublicacionComponent:

eliminarPublicacionActual() {
  const p = this.post();
  if (!p) return;

  Swal.fire({
    title: '<span class="font-logo text-xl text-red-600 uppercase tracking-widest">¿Purgar Evidencia?</span>',
    html: '<span class="font-body text-sm text-gray-300">Esta publicación y todos sus comentarios asociados serán eliminados del plano actual.</span>',
    icon: 'warning',
    showCancelButton: true,
    background: '#1a1a1a',
    color: '#e0e0e0',
    confirmButtonColor: '#a30000',
    cancelButtonColor: '#3f3f46',
    confirmButtonText: 'SÍ, PURGAR',
    cancelButtonText: 'CONSERVAR',
    customClass: {
      popup: 'border border-red-900/40 shadow-xl rounded-md',
      confirmButton: 'font-body uppercase tracking-wider font-bold px-4 py-2 rounded text-xs cursor-pointer',
      cancelButton: 'font-body uppercase tracking-wider font-bold px-4 py-2 rounded text-xs cursor-pointer'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.pubService.eliminarPublicacion(p._id).subscribe({
        next: () => {
          Swal.fire({
            title: 'Evidencia Purgada',
            text: 'El registro ha sido removido con éxito.',
            icon: 'success',
            background: '#1a1a1a',
            color: '#e0e0e0',
            confirmButtonColor: '#3f3f46'
          });
          // Volvemos al feed principal ya que esta publicación ya no existe
          this.router.navigate(['/home']);
        },
        error: (err) => console.error('Error al purgar la publicación:', err)
      });
    }
  });
}


  eliminarComentario(id: string) {
    Swal.fire({
      title: '<span class="font-logo text-xl text-red-600 uppercase tracking-widest">¿Censurar Testimonio?</span>',
      html: '<span class="font-body text-sm text-gray-300">Este aporte se desvanecerá del plano actual.</span>',
      icon: 'warning',
      showCancelButton: true,
      background: '#1a1a1a',
      color: '#e0e0e0',
      confirmButtonColor: '#a30000',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'ELIMINAR',
      cancelButtonText: 'CONSERVAR',
      customClass: {
        popup: 'border border-red-900/40 shadow-blood-glow rounded-md',
        confirmButton: 'font-body uppercase tracking-wider font-bold px-4 py-2 rounded text-xs cursor-pointer',
        cancelButton: 'font-body uppercase tracking-wider font-bold px-4 py-2 rounded text-xs cursor-pointer'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.comentarioService.eliminarComentario(id).subscribe({
          next: () => {
            // Eliminación reactiva inmediata de la UI
            this.comentarios.update(lista => lista.filter(c => c._id !== id));
            this.post.update(p => {
              if (p) {
                return { ...p, comentarios: p.comentarios.filter(cId => cId !== id) };
              }
              return null;
            });
          }
        });
      }
    });
  }

  // --- REACCIONES DE COMENTARIOS ---
  likeComentario(id: string) {
    this.comentarioService.darLike(id).subscribe({
      next: (comentarioActualizado) => {
        this.comentarios.update(lista => lista.map(c => c._id === id ? comentarioActualizado : c));
      }
    });
  }

  dislikeComentario(id: string) {
    this.comentarioService.darDislike(id).subscribe({
      next: (comentarioActualizado) => {
        this.comentarios.update(lista => lista.map(c => c._id === id ? comentarioActualizado : c));
      }
    });
  }

  alternarLikePost() {
    const p = this.post();
    if (!p) return;

    // Invocamos el endpoint de likes que ya tenías en tu servicio general de publicaciones
    this.pubService.darLike(p._id).subscribe({
      next: (postActualizado) => {
        // Al actualizar el signal, la UI recalcula los likes y el icono al instante
        this.post.set(postActualizado);
      },
      error: (err) => console.error('Error en el me gusta:', err)
    });
  }



  publicarComentario() {
  if (!this.nuevoComentarioTexto.trim() || !this.post()) return;

  const textoAInsertar = this.nuevoComentarioTexto;

  this.comentarioService.crearComentario(textoAInsertar, this.post()!._id).subscribe({
    next: (res: any) => {
      // Extraemos el objeto si viene envuelto en res.comentario o res.data
      const nuevoObj = res.comentario || res.data || res;

      // Nos aseguramos de que mantenga la propiedad 'contenido' localmente
      const comentarioNormalizado: IComentario = {
        ...nuevoObj,
        contenido: nuevoObj.contenido || nuevoObj.texto || nuevoObj.mensaje || textoAInsertar
      };

      // Actualización reactiva del array
      this.comentarios.update(lista => [...lista, comentarioNormalizado]);
      this.nuevoComentarioTexto = '';

      // Actualizamos el contador/array de IDs en el post
      this.post.update(p => {
        if (p) {
          return { ...p, comentarios: [...p.comentarios, comentarioNormalizado._id] };
        }
        return null;
      });
    },
    error: (err) => console.error('Error al sellar el comentario:', err)
  });
}

  activarEdicion(coment: any) {
  this.comentarioEditandoId = coment._id;
  this.textoEdicionTemporal = coment.contenido;
}

cancelarEdicion() {
  this.comentarioEditandoId = null;
  this.textoEdicionTemporal = '';
}

guardarEdicion(id: string) {
  if (!this.textoEdicionTemporal.trim()) return;

  this.comentarioService.editarComentario(id, this.textoEdicionTemporal).subscribe({
    next: (comentarioActualizado) => {
      // Sincronizás la lista local actualizando el signal de comentarios
      this.comentarios.update(lista =>
        lista.map(c => c._id === id ? { ...c, ...comentarioActualizado } : c)
      );
      this.cancelarEdicion();
    }
  });
}


}
