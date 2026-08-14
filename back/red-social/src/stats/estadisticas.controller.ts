import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { TokenGuard } from 'src/auth/token/token.guard';
import { AdminGuard } from 'src/auth/admin/admin.guard';

@Controller('estadisticas')
@UseGuards(TokenGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}
  
  private normalizarLapsos(inicio?: string, fin?: string, periodo?: string) {
    const hoy = new Date();
    let fechaInicio = inicio;
    let fechaFin = fin;

    if (periodo) {
      const copiaHoy = new Date();
      
      switch (periodo) {
        case 'semana':
          copiaHoy.setDate(copiaHoy.getDate() - 7);
          break;
        case 'mes':
          copiaHoy.setMonth(copiaHoy.getMonth() - 1);
          break;
        case 'anio':
          copiaHoy.setFullYear(copiaHoy.getFullYear() - 1);
          break;
        case 'historico':
          copiaHoy.setFullYear(2000, 0, 1);
          break;
        default:
          copiaHoy.setMonth(copiaHoy.getMonth() - 6);
      }
      fechaInicio = copiaHoy.toISOString().split('T')[0];
    }

    if (!fechaInicio) {
      const seisMesesAtras = new Date();
      seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6); 
      fechaInicio = seisMesesAtras.toISOString().split('T')[0];
    }

    if (!fechaFin) {
      fechaFin = hoy.toISOString().split('T')[0];
    }

    return { inicio: fechaInicio, fin: fechaFin };
  }

  @Get('publicaciones-por-usuario')
  async getPublicacionesPorUsuario(
    @Query('usuarioId') usuarioId?: string,
    @Query('periodo') periodo?: string,
  ) {
    // Pasamos undefined en las fechas manuales y dejamos el periodo al final
    const lapsos = this.normalizarLapsos(undefined, undefined, periodo);

    return this.estadisticasService.contarPublicacionesPorUsuario(
      lapsos.inicio,
      lapsos.fin,
      usuarioId,
      periodo
    );
  }

  @Get('comentarios-totales')
  async getComentariosTotales(
    @Query('usuarioId') usuarioId?: string,
    @Query('periodo') periodo?: string,
  ) {
    const lapsos = this.normalizarLapsos(undefined, undefined, periodo);
    
    return this.estadisticasService.contarComentariosTotales(
      lapsos.inicio,
      lapsos.fin,
      usuarioId,
      periodo
    );
  }

  @Get('comentarios-por-publicacion')
  async getComentariosPorPublicacion(
    @Query('usuarioId') usuarioId?: string,
    @Query('periodo') periodo?: string,
  ) {
    // console.log('[BACKEND CONTROLLER] Petición entrante a /comentarios-por-publicacion:', { usuarioId, periodo });
    const lapsos = this.normalizarLapsos(undefined, undefined, periodo);
    
    return this.estadisticasService.contarComentariosPorPublicacion(
      lapsos.inicio,
      lapsos.fin,
      usuarioId
    );
  }
}