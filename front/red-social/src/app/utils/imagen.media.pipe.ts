import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/enviroment'; // Asegurate de importar tu environment

@Pipe({
  name: 'imagenMedia',
  standalone: true
})
export class ImagenMediaPipe implements PipeTransform {

  transform(urlOriginal: string): string {
    if (!urlOriginal) {
      return 'assets/images/default-avatar.png'; // Un fallback por si no hay imagen
    }

    // Si la URL contiene localhost, la interceptamos y le clavamos la URL de Render
    if (urlOriginal.includes('localhost:3000')) {
      const pathRelativo = urlOriginal.split('localhost:3000')[1]; // Se queda con "/uploads/..."
      return `${environment.apiUrl.replace('/api', '')}${pathRelativo}`;
      // Si tu apiUrl es 'https://tu-backend.onrender.com/api', esto genera 'https://tu-backend.onrender.com/uploads/...'
    }

    // Si ya viene con el path relativo del Servidor
    if (urlOriginal.startsWith('/uploads')) {
      return `${environment.apiUrl.replace('/api', '')}${urlOriginal}`;
    }

    return urlOriginal;
  }
}
