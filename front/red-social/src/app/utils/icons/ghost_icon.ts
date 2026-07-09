import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scary-ghost-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      [attr.fill]="color"
      xmlns="http://w3.org"
      class="scary-ghost"
    >
      <!-- Cuerpo del fantasma con garras laterales y base rasgada -->
      <path d="M12 2C6.5 2 3 6 3 11C3 13 4 15 2 16C4 16.5 5 15.5 5.5 15C6 17 8 22 10 22C11 21 11.5 19.5 12 19.5C12.5 19.5 13 21 14 22C16 22 18 17 18.5 15C19 15.5 20 16.5 22 16C20 15 21 13 21 11C21 6 17.5 2 12 2Z" />

      <!-- Ojos malévolos y rasgados (en color rojo por defecto) -->
      <path d="M7 9.5L10 11L9.5 8.5L7 9.5Z" [attr.fill]="eyeColor" />
      <path d="M17 9.5L14 11L14.5 8.5L17 9.5Z" [attr.fill]="eyeColor" />

      <!-- Boca siniestra abierta -->
      <path d="M10 13.5C10.5 15.5 13.5 15.5 14 13.5C13 14 11 14 10 13.5Z" [attr.fill]="eyeColor" />
    </svg>
  `,
  styles: [`
    .scary-ghost {
      display: inline-block;
      animation: float 3s ease-in-out infinite;
      filter: drop-shadow(0 0 8px rgba(255, 0, 0, 0.2));
    }

    @keyframes float {
      0% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-6px) scale(1.02); }
      100% { transform: translateY(0px) scale(1); }
    }
  `]
})
export class ScaryGhostIcon {
  @Input() size: string | number = 48;
  @Input() color: string = '#1a1a1a'; // Cuerpo oscuro por defecto
  @Input() eyeColor: string = '#ff003c'; // Ojos rojos brillantes
}
