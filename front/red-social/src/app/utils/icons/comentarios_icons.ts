import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scary-comment-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org" class="scary-comment">
      <!-- Burbuja gótica angular -->
      <path d="M21 15C21 16.1 20.1 17 19 17H7L3 21V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V15Z" fill="#111827" stroke="#10b981" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- Ondas psicofónicas / Frecuencia espectral -->
      <line class="wave-1" x1="7" y1="10" x2="7" y2="10" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
      <line class="wave-2" x1="12" y1="8" x2="12" y2="12" stroke="#34d399" stroke-width="2" stroke-linecap="round"/>
      <line class="wave-3" x1="17" y1="9" x2="17" y2="11" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  styles: [`
    .scary-comment { display: inline-block; vertical-align: middle; }
    .wave-1 { animation: voice 0.6s infinite alternate ease-in-out; }
    .wave-2 { animation: voice 0.8s infinite alternate ease-in-out 0.2s; }
    .wave-3 { animation: voice 0.5s infinite alternate ease-in-out 0.4s; }
    @keyframes voice {
      0% { transform: scaleY(0.4); transform-origin: center; }
      100% { transform: scaleY(1.4); transform-origin: center; filter: drop-shadow(0 0 3px #10b981); }
    }
  `]
})
export class ScaryCommentIconComponent { @Input() size = 14; }
