import { Component, inject, OnInit, signal, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { PostBox } from "../post-box/post-box";
import { PostCard } from "../post-card/post-card";
import { IPublicacion } from '../../publicaciones/interfaces/publicaciones.interface';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { ScaryEvidenceIconComponent } from '../../../utils/icons/scary_evidence';
import { WebSocketService } from '../../../notifications/web-sockets-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feed',
  imports: [PostBox, PostCard, ScaryEvidenceIconComponent],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit, OnDestroy {
  private pubService = inject(PublicacionesService);
  private wsService = inject(WebSocketService);

  public usuarioLogueadoId: string = '';
  public postsArray = signal<IPublicacion[]>([]);
  public criterioOrden: 'fecha' | 'likes' = 'fecha';

  private wsSubs: Subscription[] = [];

  // Paginación y control de carga
  public limite: number = 5;
  public offset: number = 0;
  public finDeRegistros: boolean = false;
  public cargando: boolean = false;

  private observador?: IntersectionObserver;

  @ViewChild('reproductorLluvia') reproductorLluvia!: ElementRef<HTMLAudioElement>;

  @ViewChild('anclaReal') set mapearAncla(referencia: ElementRef | undefined) {
    if (referencia && this.observador) {
      this.observador.disconnect();
      this.observador.observe(referencia.nativeElement);
    }
  }

  ngOnInit(): void {
    const userJson = localStorage.getItem('paranormal_user');
    if (userJson) {
      this.usuarioLogueadoId = JSON.parse(userJson)._id;
    }

    this.cargarPublicaciones();
    this.crearInfiniteScroll();

    // 📡 Única suscripción para creación, likes y ediciones globales
    this.wsSubs.push(
      this.wsService.onPublicacionActualizada().subscribe((postRecibido: IPublicacion) => {
        this.postsArray.update(posts => {
          const index = posts.findIndex(p => p._id === postRecibido._id);

          if (index !== -1) {
            // 🔄 Si ya existe en la lista (Like / Dislike / Edición), lo actualizamos
            return posts.map(p => p._id === postRecibido._id ? postRecibido : p);
          } else {
            // ➕ Si NO existe (Post nuevo de otro usuario o propio), lo agregamos arriba de todo
            return [postRecibido, ...posts];
          }
        });
      })
    );
  }

  ngOnDestroy(): void {
    if (this.observador) {
      this.observador.disconnect();
    }
    this.wsSubs.forEach(sub => sub.unsubscribe());
  }

  cargarPublicaciones(append: boolean = false) {
    if (this.cargando) return;
    this.cargando = true;

    this.pubService.obtenerPublicaciones(this.criterioOrden, this.limite, this.offset)
      .subscribe({
        next: (nuevosPosts) => {
          if (nuevosPosts.length < this.limite) {
            this.finDeRegistros = true;
          }

          if (append) {
            this.postsArray.update(posts => {
              const idsExistentes = new Set(posts.map(p => p._id));
              const filtrados = nuevosPosts.filter(p => !idsExistentes.has(p._id));
              return [...posts, ...filtrados];
            });
          } else {
            this.postsArray.set(nuevosPosts);
          }
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error trayendo reportes:', err);
          this.cargando = false;
        }
      });
  }

  cambiarOrden(nuevoOrden: 'fecha' | 'likes') {
    if (this.criterioOrden === nuevoOrden) return;
    this.criterioOrden = nuevoOrden;
    this.offset = 0;
    this.finDeRegistros = false;
    this.cargarPublicaciones(false);
  }

  crearInfiniteScroll() {
    this.observador = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.finDeRegistros && !this.cargando && this.postsArray().length > 0) {
        this.offset += this.limite;
        this.cargarPublicaciones(true);
      }
    }, { rootMargin: '150px' });
  }

  agregarNuevoPost(formData: FormData) {
    this.pubService.crearPublicacion(formData).subscribe({
      next: () => {
        // 🛑 No modificamos 'postsArray' manualmente aquí.
        // El backend emitirá 'publicacionActualizada' vía WebSocket y el listener de ngOnInit lo insertará en tiempo real.
      },
      error: (err) => console.error('Error al archivar la evidencia:', err)
    });
  }

  onEliminarPost(id: string) {
    this.pubService.eliminarPublicacion(id).subscribe({
      next: () => this.postsArray.update(posts => posts.filter(p => p._id !== id)),
      error: (err) => console.error('Fallo ritual de eliminación:', err)
    });
  }

  onToggleLike(post: IPublicacion) {
    this.pubService.darLike(post._id).subscribe({
      error: (err) => console.error('Error al tramitar me gusta:', err)
    });
  }
}
