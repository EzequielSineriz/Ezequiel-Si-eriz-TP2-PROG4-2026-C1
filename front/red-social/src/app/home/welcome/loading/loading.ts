import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const token = localStorage.getItem('paranormal_token');

    if (!token) {
      console.log('No se detectó credencial en el plano terrenal. Evacuando al login...');
      this.router.navigate(['/auth/login']);
      return;
    }


  this.http.post('http://localhost:3000/auth/autorizar', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (usuarioValido: any) => {
        // Guardamos el usuario verificado en la señal global
        this.authService.usuarioActual.set(usuarioValido);
        console.log('✅ Usuario verificado. Iniciando contador maldito...');
        this.authService.iniciarContadorMaldito(); // 🕒 Arranca el reloj de 10 min
        this.router.navigate(['/home']); // O tu ruta de publicaciones
      },
      error: () => {
        this.authService.ForzarDestierro();
      }
    });
  }

}
