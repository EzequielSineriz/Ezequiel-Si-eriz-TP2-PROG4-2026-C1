import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {  AsideTrends } from '../../shared/aside-derecho/aside';
import { AuthService } from '../../../auth/services/auth.service';
import { PostBox } from "../post-box/post-box";
import { PostCard } from "../post-card/post-card";
import { AsideIzquierdo } from "../../shared/aside-izquierdo/aside-izquierdo";
import { RouterOutlet } from '@angular/router';
import { Feed } from "../feed/feed";
import { NavbarSuperior } from "../../shared/navbar-superior/navbar-superior";
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { Driver, driver } from 'driver.js';

@Component({
  selector: 'app-welcome',
  imports: [CommonModule, AsideTrends, AsideIzquierdo, RouterOutlet, NavbarSuperior],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome implements OnInit {
  // Inyectamos tu authService para pintar los datos reales del usuario actual de manera reactiva
  public authService = inject(AuthService);

  private homeDriverObj: Driver | null = null;

  ngOnInit() {

  console.log('Layout estructural Welcome iniciado.');
  this.homeDriverObj = driver({
      showProgress: true,
      animate: true,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: '¡Iniciar Investigación!',
      onDestroyed: () => {
        localStorage.setItem('home_tour_visto', 'true');
      },
      steps: [
        {
          element: '#tour-crear-post',
          popover: {
            title: ' 1. Transmitir Avistamiento',
            description: 'Escribí tus reportes paranormales, adjuntá evidencias y elegí la categoría adecuada para alertar a la red.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-feed-posts',
          popover: {
            title: ' 2. Bitácoras y Publicaciones',
            description: 'Explorá los expedientes compartidos por otros miembros, interactuá o archiva registros sospechosos.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#tour-tendencias',
          popover: {
            title: ' 3. Tendencias del Abismo',
            description: 'Monitoreá las anomalías y temas más discutidos en tiempo real a lo largo del globo.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#tour-top-biblioteca',
          popover: {
            title: ' 4. Archivo & Grimorios',
            description: 'Consulta los tops de material clasificado, películas recomendadas y la encuesta activa del nexo.',
            side: 'left',
            align: 'end'
          }
        }
      ]
    });

    // Disparar automáticamente si es la primera vez
    const tourVisto = localStorage.getItem('home_tour_visto');
    if (!tourVisto) {
      // Pequeño timeout para dar tiempo a que los sub-componentes carguen en el DOM
      setTimeout(() => {
        this.homeDriverObj?.drive();
      }, 1000);
    }
  }

  // Método manual para reiniciar la guía cuando el usuario quiera (ej. botón en la UI)
  reiniciarGuia() {
    this.homeDriverObj?.drive();


  }
}


// que pasa cuando llamo varias veces a un servicio de distintos componentes?
//  se comparte el estado? se reinicia? se mantiene? como funciona la inyeccion de dependencias en angular?

// En Angular, los servicios son singleton por defecto, lo que significa que cuando inyectas un servicio en diferentes componentes, todos ellos comparten la misma instancia del servicio. Esto implica que el estado dentro del servicio se mantiene y es compartido entre todos los componentes que lo utilizan.
