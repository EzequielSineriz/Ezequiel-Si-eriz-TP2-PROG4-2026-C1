// src/app/dashboard/services/usuarios.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminUsuariosService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/usuarios';

  // Helper para meter el token (si no usás un HttpInterceptor)
  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('paranormal_token')}`
      })
    };
  }

  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }

  crearUsuario(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin-alta`, datos, this.getHeaders());
  }

  deshabilitar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  habilitar(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reactivar`, {}, this.getHeaders());
  }
}
