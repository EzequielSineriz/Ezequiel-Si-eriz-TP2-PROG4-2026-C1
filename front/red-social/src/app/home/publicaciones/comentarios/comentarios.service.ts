import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IComentario } from '../comentarios/comentarios.interfaces';
import { environment } from '../../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ComentariosService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/comentarios';

  // Helper para las cabeceras seguras (Bearer Token)
  private obtenerCabeceras(): HttpHeaders {
    const token = localStorage.getItem('paranormal_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Crear un nuevo aporte paranormal
  crearComentario(contenido: string, publicacionId: string): Observable<IComentario> {
    return this.http.post<IComentario>(this.apiUrl, { contenido, publicacionId }, {
      headers: this.obtenerCabeceras()
    });
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

  // Reacciones espectrales (Likes y Dislikes)
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
