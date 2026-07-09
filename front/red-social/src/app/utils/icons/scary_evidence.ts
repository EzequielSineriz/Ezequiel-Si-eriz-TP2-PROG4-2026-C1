import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scary-evidence-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://w3.org"
      class="evidence-camera"
    >
      <!-- Chasis de la cámara gótica con bordes duros -->
      <path d="M4 7C4 5.89543 4.89543 5 6 5H9L10.5 3H13.5L15 5H18C19.1046 5 20 5.89543 20 7V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V7Z" fill="#120f1a" stroke="#10b981" stroke-width="1.2"/>

      <!-- Lente de visión nocturna / Captador de orbes paranormales -->
      <circle cx="12" cy="12.5" r="4.5" fill="#022c22" stroke="#10b981" stroke-width="1.2"/>
      <circle class="lens-glow" cx="12" cy="12.5" r="2.5" fill="#34d399" opacity="0.8"/>

      <!-- Flash/Indicador de grabación maldito (Rojo Sangre parpadeante) -->
      <circle class="rec-dot" cx="17.5" cy="8.5" r="1" fill="#ef4444"/>

      <!-- Detalle de rasguño/sangre escurriendo en la esquina inferior -->
      <path d="M17 17.5V19.5" stroke="#ef4444" stroke-width="1" stroke-linecap="round"/>
      <path d="M18.5 17V21" stroke="#ef4444" stroke-width="1" stroke-linecap="round"/>
    </svg>
  `,
  styles: [`
    .evidence-camera {
      display: inline-block;
      vertical-align: middle;
      transition: filter 0.3s ease;
    }
    /* El punto rojo parpadea simulando una grabación activa */
    .rec-dot {
      animation: pulseRed 1s infinite alternate;
    }
    /* El lente brilla con una sutil pulsación paranormal */
    .lens-glow {
      animation: pulseGreen 2s infinite alternate;
    }
    @keyframes pulseRed {
      0% { opacity: 0.3; }
      100% { opacity: 1; filter: drop-shadow(0 0 3px #ef4444); }
    }
    @keyframes pulseGreen {
      0% { opacity: 0.6; transform: scale(0.9); transform-origin: 12px 12.5px; }
      100% { opacity: 1; transform: scale(1.1); transform-origin: 12px 12.5px; filter: drop-shadow(0 0 4px #34d399); }
    }
  `]
})
export class ScaryEvidenceIconComponent {
  @Input() size: number = 18; // Tamaño ideal para acompañar el texto pequeño
}
