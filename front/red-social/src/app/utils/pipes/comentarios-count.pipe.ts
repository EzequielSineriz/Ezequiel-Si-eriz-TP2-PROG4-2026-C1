import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'espectroComentarios',
  standalone: true
})
export class EspectroComentariosPipe implements PipeTransform {
  transform(cantidad: number | any[] | undefined): string {
    const num = Array.isArray(cantidad) ? cantidad.length : (cantidad || 0);

    if (num === 0) return 'Sin actividad espectral';
    if (num === 1) return '1 psicofonía registrada';
    return `${num} testimonios en el hilo`;
  }
}
