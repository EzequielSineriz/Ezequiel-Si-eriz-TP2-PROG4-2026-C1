import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scary-heart-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org" [class.is-active]="active" class="scary-heart">
      <!-- Silueta del corazón gótico afilado -->
      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.41 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.59 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
            [attr.fill]="active ? '#dc2626' : '#111318'"
            [attr.stroke]="active ? '#ef4444' : '#4b5563'"
            stroke-width="1.5"/>
      <!-- Venas o detalles mecánicos internos -->
      <path d="M12 5V11M9 8H15" [attr.stroke]="active ? '#f87171' : '#374151'" stroke-width="1" opacity="0.6"/>
    </svg>
  `,
  styles: [`
    .scary-heart {
      display: inline-block;
      vertical-align: middle;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .scary-heart.is-active {
      animation: heartBeat 0.6s infinite alternate cubic-bezier(0.215, 0.610, 0.355, 1);
      filter: drop-shadow(0 0 6px #dc2626);
    }
    @keyframes heartBeat {
      0% { transform: scale(1); }
      100% { transform: scale(1.18); }
    }
  `]
})
export class ScaryHeartIconComponent {
  @Input() size = 14;
  @Input() active = false; // Escucha el estado 'leDioLike'
}
