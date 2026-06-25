import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoEspectral',
})
export class TiempoEspectralPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return 'Plano temporal desconocido';
    const fecha = new Date(value);
    const ahora = new Date();
    const diferenciaSegundos = Math.floor((ahora.getTime() - fecha.getTime()) / 1000);

    if (diferenciaSegundos < 60) return 'Hace instantes';
    const minutos = Math.floor(diferenciaSegundos / 60);
    if (minutos < 60) return `Hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} hs`;

    return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  }
}
