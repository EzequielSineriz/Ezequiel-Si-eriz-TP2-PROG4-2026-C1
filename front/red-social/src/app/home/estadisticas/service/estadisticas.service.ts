import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetricaEspectral } from '../interfaces/metrica.interface';
import { environment } from '../../../../environments/enviroment.development';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;;


  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('paranormal_token')}`
      })
    };
  }


  private construirParams( usuarioId?: string, periodo?: string): { headers: HttpHeaders; params: HttpParams } {
    let params = new HttpParams();
    if (usuarioId) params = params.set('usuarioId', usuarioId);
    if (periodo) params = params.set('periodo', periodo);

    return {
      headers: this.getHeaders().headers,
      params
    };
  }

  getPublicacionesPorUsuario( usuarioId?: string, periodo?: string): Observable<MetricaEspectral[]> {
    return this.http.get<MetricaEspectral[]>(`${this.apiUrl}/estadisticas/publicaciones-por-usuario`, this.construirParams(usuarioId, periodo));
  }

  getComentariosTotales(usuarioId?: string, periodo?: string): Observable<MetricaEspectral[]> {
    return this.http.get<MetricaEspectral[]>(`${this.apiUrl}/estadisticas/comentarios-totales`, this.construirParams( usuarioId, periodo));
  }

  getComentariosPorPublicacion(usuarioId?: string, periodo?: string): Observable<MetricaEspectral[]> {
    return this.http.get<MetricaEspectral[]>(`${this.apiUrl}/estadisticas/comentarios-por-publicacion`, this.construirParams(usuarioId, periodo));
  }
}
