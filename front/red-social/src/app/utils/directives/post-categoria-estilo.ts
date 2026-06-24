import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appPostCategoriaEstilo]',
})
export class PostCategoriaEstiloDirective implements OnChanges {
  @Input('appPostCategoriaEstilo') categoria!: string;

 private esquemasColor: Record<string, { cardBorder: string; cardShadow: string; badgeBorder: string; badgeText: string }> = {
    ovnis: {
      cardBorder: 'border-cyan-500/30', cardShadow: 'hover:shadow-cyan-900/20',
      badgeBorder: 'border-cyan-500/40', badgeText: 'text-cyan-400'
    },
    mitologia: {
      cardBorder: 'border-amber-600/30', cardShadow: 'hover:shadow-amber-900/20',
      badgeBorder: 'border-amber-500/40', badgeText: 'text-amber-400'
    },
    fantasmas: {
      cardBorder: 'border-emerald-500/30', cardShadow: 'hover:shadow-emerald-900/20',
      badgeBorder: 'border-emerald-500/40', badgeText: 'text-emerald-400'
    },
    general: {
      cardBorder: 'border-rose-700/30', cardShadow: 'hover:shadow-rose-900/20',
      badgeBorder: 'border-rose-500/40', badgeText: 'text-rose-400'
    }
  };


  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoria']) {
      this.aplicarEstilosEspectrales();
    }
  }

  private aplicarEstilosEspectrales(): void {
    const card = this.el.nativeElement;

    const badge = card.querySelector('.contenedor-emoji');
    const config = this.esquemasColor[this.categoria];

    Object.values(this.esquemasColor).forEach(c => {
      this.renderer.removeClass(card, c.cardBorder);
      this.renderer.removeClass(card, c.cardShadow);
      if (badge) {
        this.renderer.removeClass(badge, c.badgeBorder);
        this.renderer.removeClass(badge, c.badgeText);
      }
    });

    if (config) {
      this.renderer.addClass(card, config.cardBorder);
      this.renderer.addClass(card, config.cardShadow);

      if (badge) {
        this.renderer.addClass(badge, config.badgeBorder);
        this.renderer.addClass(badge, config.badgeText);
      }
    }

  }
}
