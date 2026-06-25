import { Component, inject, OnInit, signal, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PostBox } from "../post-box/post-box";
import { PostCard } from "../post-card/post-card";
import { IPublicacion } from '../../publicaciones/interfaces/publicaciones.interface';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';

@Component({
  selector: 'app-feed',
  imports: [PostBox, PostCard],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit, OnDestroy {
  private pubService = inject(PublicacionesService);
  public usuarioLogueadoId: string = '';

  public postsArray = signal<IPublicacion[]>([]);
  public criterioOrden: 'fecha' | 'likes' = 'fecha';


  // Paginación y control de carga
  public limite: number = 5;
  public offset: number = 0;
  public finDeRegistros: boolean = false;
  public cargando: boolean = false;

  private observador?: IntersectionObserver;

  @ViewChild('reproductorLluvia') reproductorLluvia!: ElementRef<HTMLAudioElement>;

  @ViewChild('anclaReal') set mapearAncla(referencia: ElementRef | undefined) {
    if (referencia && this.observador) {
      this.observador.disconnect(); // Limpiamos rastros previos
      this.observador.observe(referencia.nativeElement); // Lo ponemos a escuchar
    }
  }



  ngOnInit(): void {
    const userJson = localStorage.getItem('paranormal_user');
    if (userJson) {
      this.usuarioLogueadoId = JSON.parse(userJson)._id;
    }

    this.cargarPublicaciones();
    this.crearInfiniteScroll();
  }

  ngOnDestroy(): void {
    if (this.observador) {
      this.observador.disconnect();
    }

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
              // 🛡️ Filtro de seguridad anti-duplicados para evitar crash NG0955
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
      // Si el ancla entra en pantalla, no es el fin de los registros, y no estamos cargando ya una consulta...
      if (entries[0].isIntersecting && !this.finDeRegistros && !this.cargando && this.postsArray().length > 0) {
        console.log('[INFINITE SCROLL] Cargando más publicaciones... Offset actual:', this.offset + this.limite);
        this.offset += this.limite;
        this.cargarPublicaciones(true);
      }
    }, { rootMargin: '150px' }); // Pide datos 150px antes de llegar al límite visual
  }


  agregarNuevoPost(formData: FormData) {
    this.pubService.crearPublicacion(formData).subscribe({
      next: (postCreado) => {
        const datosUsuario = localStorage.getItem('paranormal_user');
        if (datosUsuario) {
          const usuario = JSON.parse(datosUsuario);
          postCreado.autorId = {
            ...usuario,
            _id: usuario._id || this.usuarioLogueadoId,
          };
        }
        this.postsArray.update(posts => [postCreado, ...posts]);
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
      next: (postActualizado) => {
        this.postsArray.update(posts => posts.map(p => p._id === postActualizado._id ? postActualizado : p));
      },
      error: (err) => console.error('Error al tramitar me gusta:', err)
    });
  }
}
