import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appPerfilEstilo]',
})
export class PerfilEstiloDirective implements OnChanges{
  // 🔮 Recibimos el rol del usuario (admin, user, etc.)
  @Input('appPerfilEstilo') perfil!: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {}



  ngOnChanges(changes: SimpleChanges): void {
  this.aplicarEstilosPorPerfil();  }

  private aplicarEstilosPorPerfil(): void {
    const elemento = this.el.nativeElement;


  if (this.perfil === 'admin') {
      // Estilos de Admin: Borde rojo, texto rojo y aura espectral
      this.renderer.addClass(elemento, 'border-red-600/40');
      this.renderer.addClass(elemento, 'text-red-500');
      this.renderer.addClass(elemento, 'shadow-[0_0_8px_rgba(163,0,0,0.2)]');

      // Removemos clases de usuario común por si las moscas
      this.renderer.removeClass(elemento, 'border-zinc-700');
      this.renderer.removeClass(elemento, 'text-zinc-400');

      elemento.innerHTML = '💀';
    } else {
      // Estilos de Investigador normal
      this.renderer.addClass(elemento, 'border-zinc-700');
      this.renderer.addClass(elemento, 'text-zinc-400');

      // Removemos clases de admin
      this.renderer.removeClass(elemento, 'border-red-600/40');
      this.renderer.removeClass(elemento, 'text-red-500');
      this.renderer.removeClass(elemento, 'shadow-[0_0_8px_rgba(163,0,0,0.2)]');

      elemento.innerHTML = '🕵️';
    }
  }
}
