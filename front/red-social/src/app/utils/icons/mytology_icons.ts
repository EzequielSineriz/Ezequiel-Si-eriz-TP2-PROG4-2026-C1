import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scary-myth-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org" class="scary-myth">
      <!-- Cráneo/Tótem Gotico -->
      <path d="M6 7C6 3.5 8.5 2 12 2C15.5 2 18 3.5 18 7C18 10 17 11 16 13V18L14 21H10L8 18V13C7 11 6 10 6 7Z" fill="#141419" stroke="#991b1b" stroke-width="1.5"/>
      <!-- Cuernos malvados -->
      <path d="M6 5C4 3 3 1 3 1C3 1 5 2 6 4" stroke="#991b1b" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M18 5C20 3 21 1 21 1C21 1 19 2 18 4" stroke="#991b1b" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Ojos Rojos Vacíos -->
      <rect x="8.5" y="7" width="2" height="3" rx="1" fill="#ef4444" />
      <rect x="13.5" y="7" width="2" height="3" rx="1" fill="#ef4444" />
      <!-- Gotas de Sangre -->
      <path class="blood-drop" d="M9.5 10v4" stroke="#ef4444" stroke-width="1" stroke-linecap="round"/>
      <path class="blood-drop-delayed" d="M14.5 10v6" stroke="#ef4444" stroke-width="1" stroke-linecap="round"/>
    </svg>
  `,
  styles: [`
    .scary-myth { filter: drop-shadow(0 0 4px #7f1d1d); }
    .blood-drop, .blood-drop-delayed {
      stroke-dasharray: 8;
      animation: drip 1.5s linear infinite;
    }
    .blood-drop-delayed { animation-delay: 0.7s; }
    @keyframes drip {
      0% { stroke-dashoffset: 8; }
      100% { stroke-dashoffset: -8; }
    }
  `]
})
export class ScaryMythIconComponent { @Input() size = 26; }
