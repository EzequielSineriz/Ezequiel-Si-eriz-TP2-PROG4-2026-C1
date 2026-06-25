import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/enviroment';

@Pipe({
  name: 'imagenMedia',
  standalone: true
})
export class ImagenMediaPipe implements PipeTransform {

  transform(urlOriginal: string): string {
    if (!urlOriginal) {
      return 'assets/images/default-avatar.png';
    }

    if (urlOriginal.includes('localhost:3000')) {
      const pathRelativo = urlOriginal.split('localhost:3000')[1];
      return `${environment.apiUrl.replace('/api', '')}${pathRelativo}`;
    }

    if (urlOriginal.startsWith('/uploads')) {
      return `${environment.apiUrl.replace('/api', '')}${urlOriginal}`;
    }

    return urlOriginal;
  }
}
