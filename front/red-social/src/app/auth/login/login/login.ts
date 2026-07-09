import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ILogin } from '../../interfaces/auth.interfaces';
import { FormUtils } from '../../../utils/forms.utils';

@Component({
  selector: 'app-login',
  imports: [RouterLink,CommonModule,ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private fb = inject(FormBuilder);
  public authService = inject(AuthService);
  public formUtils = FormUtils;
  private router = inject(Router);

  public mutado = signal<boolean>(true);


  public moderadores = [
    {
      inicial: 'A',
      username: 'AFRIADENRICH',
      email: 'AFRIADENRICH',
      pass: 'ClaveEspectro123456',
      colorClass: 'border-purple-500 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] shadow-purple-950'
    },
    {
      inicial: 'W',
      username: 'Developer-W',
      email: 'Willyams',
      pass: 'Abc123456',
      colorClass: 'border-cyan-500 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] shadow-cyan-950'
    },
    {
      inicial: 'W',
      username: 'NDIEZ-UTN',
      email: 'NataliaUtn',
      pass: 'Abc12345',
      colorClass: 'border-pink-500 text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)] shadow-pink-950'
    }
  ];

  public formulario: FormGroup = this.fb.group({
    loginIdentifier: ['', [
      Validators.required,
      Validators.pattern(/.*\S.*/)
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(6)
    ]]
  });

  ngOnInit(): void {
    // Intentamos arrancar la lluvia de fondo de forma automatizada
    setTimeout(() => {
      this.reproducirAmbiente();
    }, 800);
  }


  reproducirAmbiente() {
    const audio = document.getElementById('audioLogia') as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.15;
      audio.play().then(() => {
        this.mutado.set(false);
      }).catch(() => {
        console.warn('El navegador bloqueó el auto-play sonoro. Requiere click del investigador.');
      });
    }
  }

  alternarMusica() {
    const audio = document.getElementById('audioLogia') as HTMLAudioElement;
    if (!audio) return;

    if (this.mutado()) {
      audio.play();
      this.mutado.set(false);
    } else {
      audio.pause();
      this.mutado.set(true);
    }
  }

  // Método mágico para cargar credenciales de moderadores al hacer click en sus esferas
  cargarCredencialesRapidas(email: string, pass: string) {
    this.formulario.patchValue({
      loginIdentifier: email,
      password: pass
    });
    if (this.mutado()) this.reproducirAmbiente();
  }

  loginOAuth(provider: 'google' | 'github') {
    console.log(`Abriendo portal de autenticación OAuth via: ${provider.toUpperCase()}`);
  }

  accion() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    console.log('Invocando acceso a la Zona Oscura:', this.formulario.value);

    this.authService.login(this.formulario.value as ILogin).subscribe({
      next: (response: any) => {
        console.log('Respuesta recibida en el componente:', response);

        if (!this.authService.verificarEstadoActivo(response.user)) {
          return; // Frena el flujo, el servicio ya le tiró el cierre de sesión y alerta gótica
        }

        // ✨ ASEGURAMOS QUE EL DISCO ESCRIBA EL TOKEN CORRECTO DEL BACKEND DE RENDER
      localStorage.setItem('paranormal_token', response.token);
      localStorage.setItem('paranormal_user', JSON.stringify(response.user));

      // Actualizamos la señal reactiva
      this.authService.usuarioActual.set(response.user);

      // Le damos un respiro de 150ms para que impacte en el navegador antes de saltar al home
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 150);
      },
      error: (err) => {
        console.error('Ritual de login fallido:', err);
        this.authService.mostrarAlertaGotica(
          'Sincronización Fallida',
          err.error?.message || 'Las credenciales no coinciden con nuestros registros.',
          'error'
        );
      }
    });
  }
}
