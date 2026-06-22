import { Component, inject, OnInit, signal } from '@angular/core';
import { PostBox } from "../post-box/post-box";
import { PostCard } from "../post-card/post-card";
import { IPublicacion } from '../../publicaciones/publicaciones.interface';
import { PublicacionesService } from '../../publicaciones/publicaciones.service';

@Component({
  selector: 'app-feed',
  imports: [PostBox, PostCard],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  // 🔮 Muro de pub licaciones del plano espectral (Tu array que usa el HTML)
  private pubService = inject(PublicacionesService);
  public usuarioLogueadoId: string = localStorage.getItem('paranormal_user') || '';

  // cambiar a signals
  public postsArray = signal<IPublicacion[]>([]);
  public criterioOrden: 'fecha' | 'likes' = 'fecha';

  // Paginación
  public limite: number = 5;
  public offset: number = 0;
  public finDeRegistros: boolean = false;


  ngOnInit(): void {
    // 1. Primero, de forma obligatoria y síncrona, capturamos el ID de sesión
  const userJson = localStorage.getItem('paranormal_user');
  if (userJson) {
    this.usuarioLogueadoId = JSON.parse(userJson)._id;
  } else {
    this.usuarioLogueadoId = '';
  }

  // 2. Recién ahora, con el ID asegurado en memoria, levantamos los reportes
  this.cargarPublicaciones();
  }

  cargarPublicaciones(append: boolean = false) {
    this.pubService.obtenerPublicaciones(this.criterioOrden, this.limite, this.offset)
      .subscribe({
        next: (nuevosPosts) => {
          if (nuevosPosts.length < this.limite) {
            this.finDeRegistros = true;
          }

          if (append) {
            // 👈 .update() nos da el estado anterior para fusionarlo con el nuevo
            this.postsArray.update(posts => [...posts, ...nuevosPosts]);
          } else {
            // 👈 .set() reemplaza por completo el valor de la Signal
            this.postsArray.set(nuevosPosts);
          }
        },
        error: (err) => console.error('Error trayendo reportes del más allá:', err)
      });
  }

  cambiarOrden(nuevoOrden: 'fecha' | 'likes') {
    if (this.criterioOrden === nuevoOrden) return;
    this.criterioOrden = nuevoOrden;
    this.offset = 0;
    this.finDeRegistros = false;
    this.cargarPublicaciones();
  }

  cargarMas() {
    this.offset += this.limite;
    this.cargarPublicaciones(true);
  }

  // El PostBox ahora emite FormData
 agregarNuevoPost(formData: FormData) {
  this.pubService.crearPublicacion(formData).subscribe({
    next: (postCreado) => {
      // 🔮 Recuperamos los datos del usuario actual guardados en la sesión
      // Podés usar tu authService o el localStorage si guardaste ahí el objeto
      const datosUsuario = localStorage.getItem('paranormal_user');

      if (datosUsuario) {
        const usuario = JSON.parse(datosUsuario);

        // Populamos el autorId en el Front temporalmente para que la tarjeta se renderice perfecta al instante
        postCreado.autorId = {
          _id: usuario._id || this.usuarioLogueadoId,
          nombre: usuario.nombre || 'Tu Nombre',
          apellido: usuario.apellido || 'Tu Apellido',
          nombreUsuario: usuario.nombreUsuario || 'Tu Usuario',
          avatarUrl: usuario.avatarUrl || ''
        };
      }

      // Se añade inmediatamente arriba en la UI y Angular detecta el cambio de inmediato
      this.postsArray.update(posts => [postCreado, ...posts]);
    },
    error: (err) => console.error('Error al archivar la evidencia:', err)
  });
}

  // Manejadores de acciones que vienen desde los PostCards
  onEliminarPost(id: string) {
    this.pubService.eliminarPublicacion(id).subscribe({
    next: () => {
      // Si el plano astral del backend confirma el borrado, lo sacamos de la UI al instante
      this.postsArray.update(posts => posts.filter(p => p._id !== id));
    },
    error: (err) => {
      console.error('El ritual de eliminación falló en el servidor:', err);
    }
  });
  }

  onToggleLike(post: IPublicacion) {
  const yaTieneLike = post.usuariosQueDieronLike.includes(this.usuarioLogueadoId);

  // Como en tu backend unificamos todo en un único endpoint 'darLike' que hace toggle automático,
  // le pegamos directo a darLike pasándole el ID.
  this.pubService.darLike(post._id).subscribe({
    next: (postActualizado) => {
      // 🔥 Mapeamos creando un array completamente nuevo para forzar la reactividad de la UI
      this.postsArray.update(posts => posts.map(p => p._id === postActualizado._id ? postActualizado : p));
    },
    error: (err) => console.error('Error al tramitar el me gusta:', err)
  });
}
}
