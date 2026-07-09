import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scary-trash-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org" class="scary-trash">
      <!-- Almas atrapadas saliendo en hover -->
      <path class="souls" d="M9 4C9 2 10 1 12 1C14 1 15 2 15 4" stroke="#f43f5e" stroke-width="1" stroke-dasharray="2" opacity="0"/>
      <!-- Tapa articulada gótica -->
      <path class="trash-lid" d="M19 6H5V4H9L10 3H14L15 4H19V6Z" fill="#18181b" stroke="#4b5563" stroke-width="1.5"/>
      <!-- Cuerpo del incinerador -->
      <path d="M6 8V20C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20V8H6Z" fill="#111115" stroke="#4b5563" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- Rejas/Marcas de garras frontales -->
      <path d="M10 11V17M14 11V17" stroke="#991b1b" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `,
  styles: [`
    .scary-trash { display: inline-block; vertical-align: middle; transition: all 0.2s ease; }
    /* Animación combinada en hover del padre */
    :host-context(:hover) .trash-lid {
      transform: translateY(-2px) rotate(-12px);
      transform-origin: 5px 6px;
      stroke: #f43f5e;
    }
    :host-context(:hover) .scary-trash {
      filter: drop-shadow(0 0 4px rgba(244, 63, 94, 0.4));
    }
    :host-context(:hover) .souls {
      opacity: 1;
      animation: escape 0.8s infinite linear;
    }
    @keyframes escape {
      0% { stroke-dashoffset: 0; opacity: 0.8; }
      100% { stroke-dashoffset: -6; opacity: 0; }
    }
  `]
})
export class ScaryTrashIconComponent { @Input() size = 16; }
