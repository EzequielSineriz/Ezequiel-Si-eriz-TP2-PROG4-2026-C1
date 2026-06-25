import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/enviroment';

@Pipe({
  name: 'imagenMedia',
  standalone: true // Si lo usás en componentes standalone
})
export class ImagenMediaPipe implements PipeTransform {

transform(urlOriginal: any): string {
  const fallback = 'assets/images/default-avatar.png';

  if (!urlOriginal || typeof urlOriginal !== 'string') {
    return fallback;
  }

  const urlLimpia = urlOriginal.trim();

  // 1. Si viene con localhost:3000 de desarrollo, lo mandamos a la raíz de Render
  if (urlLimpia.includes('localhost:3000')) {
    const pathRelativo = urlLimpia.split('localhost:3000')[1];
    return `${environment.apiUrl}${pathRelativo}`;
  }

  // 2. Si es una ruta relativa pura (/uploads/...) le pegamos la URL base de Render adelante
  if (urlLimpia.startsWith('/uploads')) {
    return `${environment.apiUrl}${urlLimpia}`;
  }

  return urlLimpia;
}
}
