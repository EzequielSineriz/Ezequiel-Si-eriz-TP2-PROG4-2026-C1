import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scary-general-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org" class="scary-general">
      <!-- Pergamino enrollado y roto -->
      <path d="M4 19.5C4 18.12 5.12 17 6.5 17H20V4H6.5C5.12 4 4 5.12 4 6.5V19.5ZM4 19.5C4 20.88 5.12 22 6.5 22H18" stroke="#701a75" stroke-width="1.5" fill="#120c1f" stroke-linejoin="round"/>
      <!-- Grietas/Rasgaduras góticas -->
      <path d="M10 7H16M10 11H15M7 15H12" stroke="#4a044e" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Mancha de sangre derramada -->
      <path d="M15 12C15.5 13.5 14 15 16 16.5C18 18 19 14.5 17 13C15.8 12.1 15 11 15 12Z" fill="#ef4444" opacity="0.8"/>
    </svg>
  `,
  styles: [`
    .scary-general {
      animation: scrollVibe 2.5s ease-in-out infinite alternative;
    }
    @keyframes scrollVibe {
      0% { filter: drop-shadow(0 0 1px #701a75); }
      100% { filter: drop-shadow(0 0 6px #f472b6); }
    }
  `]
})
export class ScaryGeneralIconComponent { @Input() size = 24; }
