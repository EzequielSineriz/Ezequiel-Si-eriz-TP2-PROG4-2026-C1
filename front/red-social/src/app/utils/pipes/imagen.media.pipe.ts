import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/enviroment';

@Pipe({
  name: 'imagenMedia',
  standalone: true // Si lo usás en componentes standalone
})
export class ImagenMediaPipe implements PipeTransform {

  transform(urlOriginal: any): string {
    const fallback = 'assets/images/default-avatar.png';

    // 1. Control de seguridad contra nulos, indefinidos o tipos incorrectos
    if (!urlOriginal || typeof urlOriginal !== 'string') {
      return fallback;
    }

    const urlLimpia = urlOriginal.trim();

    // 2. Si viene de la época de desarrollo local, la redirigimos a Render
    if (urlLimpia.includes('localhost:3000')) {
      const pathRelativo = urlLimpia.split('localhost:3000')[1];
      // Limpiamos el /api si tu url de entorno lo trae, para apuntar a la raíz de estáticos de Render
      const baseApi = environment.apiUrl.replace('/api', '');
      return `${baseApi}${pathRelativo}`;
    }

    // 3. Si la base de datos devuelve el path relativo directo del backend (ej: "/uploads/avatar.png")
    if (urlLimpia.startsWith('/uploads')) {
      const baseApi = environment.apiUrl.replace('/api', '');
      return `${baseApi}${urlLimpia}`;
    }

    // 4. Si es una URL externa (Cloudinary, Supabase o URL absoluta de Render)
    return urlLimpia;
  }
}
