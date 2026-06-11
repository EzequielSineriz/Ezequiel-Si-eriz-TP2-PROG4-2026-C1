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
import { PublicacionesService } from '../../publicaciones/publicaciones.service';

@Component({
  selector: 'app-welcome',
  imports: [CommonModule, AsideTrends, AsideIzquierdo, RouterOutlet, NavbarSuperior],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome implements OnInit {
  // Inyectamos tu authService para pintar los datos reales del usuario actual de manera reactiva
  public authService = inject(AuthService);

  ngOnInit() {

  console.log('Layout estructural Welcome iniciado.');

  }
}


// que pasa cuando llamo varias veces a un servicio de distintos componentes?
//  se comparte el estado? se reinicia? se mantiene? como funciona la inyeccion de dependencias en angular?

// En Angular, los servicios son singleton por defecto, lo que significa que cuando inyectas un servicio en diferentes componentes, todos ellos comparten la misma instancia del servicio. Esto implica que el estado dentro del servicio se mantiene y es compartido entre todos los componentes que lo utilizan.
