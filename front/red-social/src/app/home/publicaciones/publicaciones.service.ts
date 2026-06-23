import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPublicacion } from './publicaciones.interface';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/publicaciones';
  private authService = inject(AuthService);

  private obtenerCabeceras(): HttpHeaders {
    // Reemplazá 'obtenerToken()' o 'token' por cómo se llame en tu AuthService
    const token =  localStorage.getItem('paranormal_token');

    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // Estándar Bearer Token para JWT
    });
  }



  // GET: Listar con filtros y paginación
  obtenerPublicaciones(sort: 'fecha' | 'likes' = 'fecha', limit: number = 5, offset: number = 0): Observable<IPublicacion[]> {
  // Aseguramos matemáticamente que sean enteros limpios
  const parseLimit = Math.floor(Number(limit)) || 5;
  const parseOffset = Math.floor(Number(offset)) || 0;

  const params = new HttpParams()
    .set('sort', sort)
    .set('limit', parseLimit.toString())
    .set('offset', parseOffset.toString());

  return this.http.get<IPublicacion[]>(`${this.apiUrl}`, {
    params,
    headers: this.obtenerCabeceras()
  });
}

  // POST: Crear publicación (Recibe FormData por la imagen)
  crearPublicacion(formData: FormData): Observable<IPublicacion> {
    return this.http.post<IPublicacion>(this.apiUrl, formData, {
      headers: this.obtenerCabeceras()
    });
  }

  obtenerPublicacionPorId(id: string): Observable<IPublicacion> {
  // Le pegamos directo a la URL base de publicaciones sumándole el ID del posteo
  return this.http.get<IPublicacion>(`${this.apiUrl}/${id}`, {
    headers: this.obtenerCabeceras()
  });
}



  // DELETE: Baja lógica
  eliminarPublicacion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.obtenerCabeceras()
    });
  }

  // POST: Dar me gusta
  darLike(id: string): Observable<IPublicacion> {
    return this.http.post<IPublicacion>(`${this.apiUrl}/${id}/like`, {}, {
      headers: this.obtenerCabeceras()
    });
  }

  // DELETE: Quitar me gusta
  quitarLike(id: string): Observable<IPublicacion> {
    return this.http.delete<IPublicacion>(`${this.apiUrl}/${id}/like`, {
      headers: this.obtenerCabeceras()
    });
  }



  obtenerMetricasPerfil(): Observable<{ ultimasPublicaciones: IPublicacion[], totalPublicaciones: number, meGustasTotales: number }> {
    return this.http.get<{ ultimasPublicaciones: IPublicacion[], totalPublicaciones: number, meGustasTotales: number }>(
      `${this.apiUrl}/perfil/metricas`,{
      headers: this.obtenerCabeceras()
    });
  }
    ;
  }

