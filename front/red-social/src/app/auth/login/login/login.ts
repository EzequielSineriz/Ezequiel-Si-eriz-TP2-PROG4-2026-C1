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

  public mutado = signal<boolean>(true);

  // 🔮 Listado de investigadores autorizados (se inyectan directo en los inputs)
  public moderadores = [
    {
      inicial: 'A',
      username: 'AFRIADENRICH',
      email: 'afria@paranormal.com',
      pass: 'claveEspectro123',
      colorClass: 'border-purple-500 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] shadow-purple-950'
    },
    {
      inicial: 'R',
      username: 'RAMIROALFONZO',
      email: 'ramiro@paranormal.com',
      pass: 'portalAbierto99',
      colorClass: 'border-cyan-500 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] shadow-cyan-950'
    },
    {
      inicial: 'N',
      username: 'NDIEZ-UTN',
      email: 'ndiez@utn.com',
      pass: 'investigacion2026',
      colorClass: 'border-pink-500 text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)] shadow-pink-950'
    }
  ];

  public formulario: FormGroup = this.fb.group({
    loginIdentifier: ['', [
      Validators.required,
      Validators.pattern(FormUtils.notOnlySpacesPattern)
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
      audio.volume = 0.25; // Seteamos un volumen ambiente sutil para no aturdir
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

  // Manejador genérico para botones de redes externas
  loginOAuth(provider: 'google' | 'github') {
    console.log(`Abriendo portal de autenticación OAuth via: ${provider.toUpperCase()}`);
    // Si tenés implementada la redirección en el authService de NestJS la podés gatillar acá
    // window.location.href = `http://localhost:3000/auth/${provider}`;
  }

  accion() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    console.log('Invocando acceso a la Zona Oscura:', this.formulario.value);
    this.authService.login(this.formulario.value as ILogin);
  }
}
