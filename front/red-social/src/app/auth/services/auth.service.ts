import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IRegistro, IAuthResponse, ILogin } from '../interfaces/auth.interfaces';
import Swal from 'sweetalert2';
import { AbstractControl, FormGroup } from '@angular/forms';
import { of, delay, map, catchError, tap, Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = environment.apiUrl;

  public usuarioActual = signal<any | null>(null);
  private timerSesion: any;

  constructor() {
    this.verificarTokenExistente();
  }

  registrar(datos: IRegistro | FormData, formulario?: FormGroup): void {
    this.http.post<IAuthResponse>(`${this.apiUrl}/auth/registro`, datos).subscribe({
      next: (response) => {
        console.log('Iniciación Exitosa:', response);

        this.mostrarAlertaGotica(
          '¡Sello Completado!',
          `Tu cuenta ha sido registrada en la base de datos central.`,
          'success',
        );
        if (formulario) {
          formulario.reset({ terms: false });
        }

        localStorage.setItem('paranormal_token', response.token);
        localStorage.setItem('paranormal_user', JSON.stringify(response.user));

        this.usuarioActual.set(response.user);

        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error crudo:', err);

        if (err.error && err.error.message) {
          console.table(err.error.message);

          const listaErrores = Array.isArray(err.error.message)
            ? err.error.message.join('<br>')
            : err.error.message;

          this.mostrarAlertaGotica('Ritual Fallido', listaErrores, 'error');
        } else {
          this.mostrarAlertaGotica('Ritual Fallido', 'Error de comunicación.', 'error');
        }
      },
    });
  }

  login(credenciales: ILogin): Observable<any> {
    return this.http.post<IAuthResponse>(`${this.apiUrl}/auth/ingresar`, credenciales)
      .pipe(
        tap((response) => {
          console.log('Ingreso concedido en segundo plano:', response);

          // Guardamos el token de forma segura en el navegador para los Guards
          localStorage.setItem('paranormal_token', response.token);
          localStorage.setItem('paranormal_user', JSON.stringify(response.user));

          // Actualizamos el Signal reactivo y el reloj de arena
          this.usuarioActual.set(response.user);
          this.iniciarContadorMaldito();
        })
      );
  }

  cerrarSesion(): void {
    localStorage.removeItem('paranormal_token');
    localStorage.removeItem('paranormal_user');
    this.usuarioActual.set(null);
    this.router.navigate(['/auth/login']);
  }


  public get esAdmin(): boolean {
  const usuario = this.usuarioActual();
    // Comprobamos si coincide con tu enum de la base de datos
    return usuario?.perfil === 'admin';
  }

  // Agregar en el login para verificar si el usuario está activo o no
  public verificarEstadoActivo(usuario: any): boolean {
  if (usuario && usuario.activo === false) {
    this.mostrarAlertaGotica(
      'Acceso Denegado',
      'Tu cuenta ha sido deshabilitada en este plano. Contactá al administrador.',
      'error'
    );
    this.cerrarSesion();
    return false;
  }
  return true;
}
  // Checkear si venía logueado previamente al recargar la página
  private verificarTokenExistente(): void {
    const token = localStorage.getItem('paranormal_token');
    const userJson = localStorage.getItem('paranormal_user');

    if (token && userJson) {
      try {
        // Al levantar de localStorage, lo parseamos a JSON real antes de setear el Signal
        this.usuarioActual.set(JSON.parse(userJson));
      } catch (e) {
        this.cerrarSesion();
      }
    }
  }

  public mostrarAlertaGotica(titulo: string, texto: string, icono: 'success' | 'error') {
    return Swal.fire({
      title: `<span class="font-logo uppercase tracking-widest text-2xl">${titulo}</span>`,
      html: `<span class="font-body text-sm text-gray-300">${texto}</span>`,
      icon: icono,
      background: '#1a1a1a', // Tu color --color-para-card
      color: '#e0e0e0', // Tu color --color-para-text
      confirmButtonColor: '#a30000', // Botón Rojo Sangre
      iconColor: icono === 'success' ? '#00ffc3' : '#a30000', // Cian Ectoplásmico para éxito, Sangre para error
      customClass: {
        popup: 'border border-white/10 shadow-blood-glow rounded-md',
        confirmButton: 'font-body uppercase tracking-wider font-bold px-6 py-3 rounded text-xs',
      },
    });
  }

  validarEmailUnico(control: AbstractControl) {
    const email = control.value;
    if (!email) return of(null);

    // Le pegamos al endpoint de NestJS
    return this.http
      .get<{ exists: boolean }>(`${this.apiUrl}/auth/check-email?email=${email}`)
      .pipe(
        delay(500), // Un delay sutil de 500ms (¡no 2 segundos y medio!) para no saturar a peticiones mientras escribe
        map((resp) => {
          // Si el backend dice que existe, retornamos el error para que Angular pinte el input de rojo
          return resp.exists ? { emailTaken: true } : null;
        }),
        catchError(() => of(null)), // Si falla el servidor o da error, dejamos pasar para no trabar al usuario
      );
  }

  iniciarContadorMaldito() {
    if (this.timerSesion) {
      console.log('🔄 Reiniciando cronómetro espiritual anterior...');
      clearTimeout(this.timerSesion);
    }

    console.log('⏳ El reloj de arena ha comenzado. Frecuencia sintonizada.');

    const tiempoEsperaPrueba = 10 * 10000;
    const tiempoEsperaReal = 10 * 60 * 1000;

    //  A los 10 minutos (10 * 60 * 1000 ms) se manifiesta la advertencia
    this.timerSesion = setTimeout(() => {
      console.warn('⚠️ El contador llegó a los 10 segundos. Desplegando advertencia gótica...');
      this.mostrarModalExtensionSesion();
    }, tiempoEsperaPrueba);
  }

  private mostrarModalExtensionSesion() {
    Swal.fire({
      title:
        '<span class="font-logo uppercase tracking-widest text-lg text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">⚠️ Alianza por Expirar</span>',
      html: `
        <div class="font-body text-xs text-gray-300 space-y-2">
          <p>Tu conexión con el plano espectral se desvanecerá en <span class="text-amber-400 font-bold">5 minutos</span>.</p>
          <p class="text-gray-500 italic">¿Deseas canalizar energía y extender tu permanencia?</p>
        </div>
      `,
      icon: 'warning',
      iconColor: '#f59e0b',
      showCancelButton: true,
      background: '#0d0d0d',
      color: '#e0e0e0',
      confirmButtonColor: '#10b981', // Verde esmeralda para aceptar
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'EXTENDER PERMANENCIA',
      cancelButtonText: 'ABANDONAR',
      customClass: {
        popup: 'border border-amber-900/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] rounded-md',
        confirmButton:
          'font-body uppercase tracking-wider font-bold px-4 py-2 rounded text-xs cursor-pointer',
        cancelButton:
          'font-body uppercase tracking-wider font-bold px-4 py-2 rounded text-xs cursor-pointer',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.refrescarTokenEspectral().subscribe({
          next: () => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Vínculo renovado por 15 minutos más',
              showConfirmButton: false,
              timer: 3000,
              background: '#0d0d0d',
              color: '#10b981',
            });
          },
          error: () => this.ForzarDestierro(),
        });
      } else {
        this.ForzarDestierro();
      }
    });
  }

  refrescarTokenEspectral(): Observable<any> {
    const tokenViejo = localStorage.getItem('paranormal_token');
    return this.http
      .post<any>(
        `${this.apiUrl}/auth/refrescar`,
        {},
        {
          headers: { Authorization: `Bearer ${tokenViejo}` },
        },
      )
      .pipe(
        tap((res) => {
          // Guardamos el nuevo token de 15 minutos devuelto por NestJS
          localStorage.setItem('paranormal_token', res.token);
          // Reiniciamos el reloj de arena
          this.iniciarContadorMaldito();
        }),
      );
  }

  ForzarDestierro() {
    if (this.timerSesion) clearTimeout(this.timerSesion);
    localStorage.removeItem('paranormal_token');
    localStorage.removeItem('paranormal_user');
    this.usuarioActual.set(null);
    console.warn('⛔ El vínculo se ha cortado. Redirigiendo al plano de login...');
    this.router.navigate(['/auth/login']);
  }

  actualizarPerfilUsuario(
    id: string,
    descripcion: string,
    avatarArchivo: File | null,
  ): Observable<any> {
    const formData = new FormData();
    formData.append('descripcion', descripcion);

    if (avatarArchivo) {
      formData.append('avatar', avatarArchivo); // Coincide con el 'avatar' del backend Interceptor
    }

    const token = localStorage.getItem('paranormal_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .put(`http://localhost:3000/auth/usuarios/${id}/perfil`, formData, { headers })
      .pipe(
        tap((usuarioActualizado: any) => {
          // 🔮 Sincronización crucial: actualizamos el LocalStorage y el Signal de la sesión global
          const sesionActual = this.usuarioActual(); // Asumiendo que es un Signal
          if (sesionActual) {
            const nuevaSesion = sesionActual.user
              ? { ...sesionActual, user: usuarioActualizado }
              : usuarioActualizado;

            localStorage.setItem('paranormal_user', JSON.stringify(nuevaSesion));
            // Si tu signal es de escritura, lo actualizás (ej: this.usuarioActual.set(nuevaSesion));
          }
        }),
      );
  }
}
