// src/app/dashboard/services/usuarios.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment.development';

@Injectable({ providedIn: 'root' })
export class AdminUsuariosService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;;

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('paranormal_token')}`
      })
    };
  }

  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`, this.getHeaders());
  }

  crearUsuario(datos: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/admin-alta`, datos, this.getHeaders());
  }

  deshabilitar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/usuarios/${id}`, this.getHeaders());
  }

  habilitar(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/${id}/reactivar`, {}, this.getHeaders());
  }
}
