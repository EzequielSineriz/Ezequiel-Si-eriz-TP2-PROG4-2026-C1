import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'censuraParanormal',
  standalone: true
})
export class CensuraParanormalPipe implements PipeTransform {

  private palabrasProhibidas = ['puto', 'gobierno', 'fbi', 'milei', 'alien','kirchner','epstein','Epstein'];

  transform(value: string): string {
    if (!value) return '';
    let textoFiltrado = value;

    this.palabrasProhibidas.forEach(palabra => {
      const regex = new RegExp(palabra, 'gi');
      textoFiltrado = textoFiltrado.replace(regex, '██████');
    });

    return textoFiltrado;
  }
}
