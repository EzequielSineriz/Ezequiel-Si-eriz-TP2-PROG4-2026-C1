import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IComentario } from '../comentarios/comentarios.interfaces';
import { environment } from '../../../../environments/enviroment.development';

@Injectable({
  providedIn: 'root'
})
export class ComentariosService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/comentarios';

  private obtenerCabeceras(): HttpHeaders {
    const token = localStorage.getItem('paranormal_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  crearComentario(contenido: string, publicacionId: string) {
  return this.http.post<IComentario>(`${this.apiUrl}`, { contenido, publicacionId }).pipe(
    map((res: any) => {
      // Si el backend responde con { mensaje: 'Ok', comentario: { ... } }
      const item = res.comentario || res;
      return {
        ...item,
        contenido: item.contenido || item.texto || contenido
      };
    })
  );
}

  // Obtener todos los comentarios de un posteo específico
  obtenerPorPublicacion(pubId: string): Observable<IComentario[]> {
    return this.http.get<IComentario[]>(`${this.apiUrl}/publicacion/${pubId}`, {
      headers: this.obtenerCabeceras()
    });
  }

  // Borrado lógico del comentario
  eliminarComentario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.obtenerCabeceras()
    });
  }

  darLike(id: string): Observable<IComentario> {
    return this.http.post<IComentario>(`${this.apiUrl}/${id}/like`, {}, {
      headers: this.obtenerCabeceras()
    });
  }

  darDislike(id: string): Observable<IComentario> {
    return this.http.post<IComentario>(`${this.apiUrl}/${id}/dislike`, {}, {
      headers: this.obtenerCabeceras()
    });
  }

  editarComentario(id: string, nuevoContenido: string): Observable<IComentario> {
  return this.http.put<IComentario>(`${this.apiUrl}/${id}`, { contenido: nuevoContenido }, {
    headers: this.obtenerCabeceras()
  });
}
}
