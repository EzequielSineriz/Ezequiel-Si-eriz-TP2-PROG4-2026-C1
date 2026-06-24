import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from 'src/publicaciones/publicacion.schema'; 
import { Usuario } from 'src/usuarios/usuario.schema';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel('Publicacion') private readonly publicacionModel: Model<Publicacion>,
    @InjectModel('Usuario') private readonly usuarioModel: Model<Usuario>,
  ) {}

  private calcularRangoYAgrupacion(periodo: string) {
    const fechaActual = new Date();
    let fechaInicio = new Date();
    let idAgrupacion: any;

    switch (periodo) {
      case 'semana':
        // Forzamos los últimos 7 días exactos hacia atrás
        fechaInicio.setDate(fechaActual.getDate() - 6);
        fechaInicio.setHours(0, 0, 0, 0);
        idAgrupacion = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;

      case 'mes':
        // Forzamos los últimos 30 días exactos para subdividir en semanas 1 a 4
        fechaInicio.setDate(fechaActual.getDate() - 30);
        fechaInicio.setHours(0, 0, 0, 0);
        idAgrupacion = {
          $floor: { $divide: [{ $subtract: [{ $dayOfMonth: '$createdAt' }, 1] }, 7] }
        };
        break;

      case 'anio':
        // Forzamos el inicio del año actual (1 de Enero) para mostrar la evolución del año
        fechaInicio = new Date(fechaActual.getFullYear(), 0, 1, 0, 0, 0, 0);
        idAgrupacion = { $month: '$createdAt' };
        break;

      case 'historico':
      default:
        // Histórico completo sin límite inferior estricto
        fechaInicio = new Date(2020, 0, 1); 
        idAgrupacion = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
    }

    return { fechaInicio, idAgrupacion };
  }

  private rellenarVelasEstructuradas(datos: any[], periodo: string): { label: string; value: number }[] {
    const resultado: { label: string; value: number }[] = [];
    const fechaActual = new Date();

    if (periodo === 'semana') {
      const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(fechaActual.getDate() - i);
        const isoFecha = d.toISOString().substring(0, 10);
        const nombreDia = diasSemana[d.getDay()];
        
        const registro = datos.find(item => item.label === isoFecha);
        resultado.push({
          label: `${nombreDia} ${d.getDate()}`,
          value: registro ? registro.value : 0
        });
      }
      return resultado;
    } 
    
    if (periodo === 'mes') {
      for (let sem = 0; sem < 4; sem++) {
        const registro = datos.find(item => Number(item.label) === sem);
        resultado.push({
          label: `Semana ${sem + 1}`,
          value: registro ? registro.value : 0
        });
      }
      return resultado;
    } 
    
    if (periodo === 'anio') {
      const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const mesActualId = fechaActual.getMonth(); // 5 para Junio
      
      for (let m = 0; m <= mesActualId; m++) {
        const registro = datos.find(item => Number(item.label) === (m + 1));
        resultado.push({
          label: nombresMeses[m],
          value: registro ? registro.value : 0
        });
      }
      return resultado;
    }

    // Histórico por defecto (mantiene la estructura YYYY-MM que te gustó)
    return datos;
  }

  async contarPublicacionesPorUsuario(inicio: string, fin: string, usuarioId?: string, periodo: string = 'mes') {
    if (usuarioId && usuarioId !== 'ID_INVALIDO_NEXO') {
      const { fechaInicio, idAgrupacion } = this.calcularRangoYAgrupacion(periodo);
      
      const filtroUsuario = {
        autorId: new Types.ObjectId(usuarioId),
        eliminada: false,
        createdAt: { $gte: fechaInicio }
      };

      const resultado = await this.publicacionModel.aggregate([
        { $match: filtroUsuario },
        { $group: { _id: idAgrupacion, cantidad: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, label: '$_id', value: '$cantidad' } }
      ]);

      return this.rellenarVelasEstructuradas(resultado, periodo);
    }

    // Si es global (Métricas Generales), usamos el filtro por defecto de los inputs de fecha
    const filtroGlobal = {
      eliminada: false,
      createdAt: {
        $gte: new Date(`${inicio}T00:00:00.000Z`),
        $lte: new Date(`${fin}T23:59:59.999Z`),
      }
    };

    return await this.publicacionModel.aggregate([
      { $match: filtroGlobal },
      { $group: { _id: '$autorId', cantidad: { $sum: 1 } } },
      { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'usuarioInfo' } },
      { $unwind: '$usuarioInfo' },
      { $project: { _id: 0, label: '$usuarioInfo.nombreUsuario', value: '$cantidad' } }
    ]);
  }

  async contarComentariosTotales(inicio: string, fin: string, usuarioId?: string, periodo: string = 'mes') {
    const { fechaInicio, idAgrupacion } = this.calcularRangoYAgrupacion(periodo);

    const filtro: any = {
      eliminada: false,
      createdAt: { $gte: fechaInicio }
    };
    
    if (usuarioId && usuarioId !== 'ID_INVALIDO_NEXO') {
      filtro.autorId = new Types.ObjectId(usuarioId);
    }

    const resultado = await this.publicacionModel.aggregate([
      { $match: filtro },
      { $unwind: '$comentarios' },
      { $group: { _id: idAgrupacion, cantidad: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, label: '$_id', value: '$cantidad' } },
    ]);

    return this.rellenarVelasEstructuradas(resultado, periodo);
  }

  async contarComentariosPorPublicacion(inicio: string, fin: string, usuarioId?: string) {
    const filtro: any = {
      eliminada: false,
      createdAt: {
        $gte: new Date(`${inicio}T00:00:00.000Z`),
        $lte: new Date(`${fin}T23:59:59.999Z`),
      }
    };
    if (usuarioId && usuarioId !== 'ID_INVALIDO_NEXO') filtro.autorId = new Types.ObjectId(usuarioId);

    return this.publicacionModel.aggregate([
      { $match: filtro },
      {
        $project: {
          _id: 0,
          label: { $ifNull: ['$titulo', { $substr: ['$contenido', 0, 15] }] },
          value: { $size: { $ifNull: ['$comentarios', []] } },
        },
      },
      { $match: { value: { $gt: 0 } } }
    ]);
  }
}