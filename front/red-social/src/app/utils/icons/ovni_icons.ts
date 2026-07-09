import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scary-ufo-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org" class="scary-ufo">
      <!-- Cúpula de la nave -->
      <path d="M12 4C9 4 7 6 7 8H17C17 6 15 4 12 4Z" fill="#2d1b4e" stroke="#10b981" stroke-width="1.2"/>
      <!-- Cuerpo del platillo afilado -->
      <path d="M2 11L4 9H20L22 11L12 14L2 11Z" fill="#1f1f2e" stroke="#10b981" stroke-width="1.2"/>
      <!-- Luces inferiores/Ojos alienígenas -->
      <circle cx="7" cy="11.5" r="0.8" fill="#ef4444"/>
      <circle cx="12" cy="12" r="0.8" fill="#ef4444"/>
      <circle cx="17" cy="11.5" r="0.8" fill="#ef4444"/>
      <!-- Haz de abducción radiactivo -->
      <polygon points="9,14 6,22 18,22 15,14" fill="url(#ufoGlow)" opacity="0.7"/>

      <defs>
        <linearGradient id="ufoGlow" x1="12" y1="14" x2="12" y2="22">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  `,
  styles: [`
    .scary-ufo {
      animation: ufoPulse 2s ease-in-out infinite alternate;
    }
    @keyframes ufoPulse {
      0% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 2px #10b981); }
      100% { transform: translateY(-2px) scale(1.05); filter: drop-shadow(0 0 8px #10b981); }
    }
  `]
})
export class ScaryUfoIconComponent { @Input() size = 26; }
