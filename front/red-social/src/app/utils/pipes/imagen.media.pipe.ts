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

  // 1. Si apunta al localhost viejo de desarrollo, lo mandamos a la RAÍZ de Render (donde viven los estáticos)
  if (urlLimpia.includes('localhost:3000')) {
    const pathRelativo = urlLimpia.split('localhost:3000')[1];
    const baseRaiz = environment.apiUrl.replace('/api', '');
    return `${baseRaiz}${pathRelativo}`;
  }

  // 2. Si es una ruta relativa pura que empieza con /uploads, va a la RAÍZ de Render
  if (urlLimpia.startsWith('/uploads')) {
    const baseRaiz = environment.apiUrl.replace('/api', '');
    return `${baseRaiz}${urlLimpia}`;
  }

  // 3. ¡La Clave! Si la URL ya es una dirección web completa de Render (contiene "onrender.com")
  // pero NO incluye "/uploads", significa que es una foto de perfil externa o un link roto.
  // No le tocamos nada para no romper el "/api" de las consultas.
  if (urlLimpia.includes('onrender.com') && !urlLimpia.includes('/uploads')) {
    return urlLimpia;
  }

  return urlLimpia;
}
}
