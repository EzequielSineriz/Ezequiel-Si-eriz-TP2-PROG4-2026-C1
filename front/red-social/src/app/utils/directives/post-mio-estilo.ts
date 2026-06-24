import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appPostMioEstilo]',
})
export class PostMioEstiloDirective implements OnChanges{

  @Input('appPostMioEstilo') esPropio!: boolean;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.evaluarEstiloDestacado();
  }

  private evaluarEstiloDestacado(): void {
    const elemento = this.el.nativeElement;

    if (this.esPropio) {
      // Si es mío:  violeta paranormal
      this.renderer.setStyle(elemento, 'border-color', 'rgba(34, 211, 238, 0.6)'); // Cyan 400 con opacidad
      this.renderer.setStyle(elemento, 'box-shadow', '0 0 12px rgba(6, 182, 212, 0.2)'); // Brillo sutil cian
      this.renderer.setStyle(elemento, 'background-color', 'rgba(6, 182, 212, 0.03)'); // Un fondo milimétricamente diferente
    }
  }
}
