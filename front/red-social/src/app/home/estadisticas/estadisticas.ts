import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { EstadisticasService } from './service/estadisticas.service';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { AdminUsuariosService } from '../admin/admin.service';
import { UsuarioDashboard } from '../usuarios/usuarioDashboard.interface';
import { forkJoin } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './estadisticas.html',
})
export class Estadisticas implements OnInit {
  private statsService = inject(EstadisticasService);
  private usuariosService = inject(AdminUsuariosService);

  public usuarioSeleccionado = signal<string>('');
  public busquedaAlias = signal<string>('');
  public periodoSeleccionado = signal<string>('mes');
  public listaUsuarios = signal<UsuarioDashboard[]>([]);
  public cargando = signal<boolean>(true);

  // Rangos de fecha y escala
  public fechaInicio = signal<string>('');
  public fechaFin = signal<string>('');

  // Estilos globales neón para los gráficos
  private colorBordeCarmesí = '#a30000';

  // 📊 1. Configuración Gráfico de Barras Verticales (Publicaciones por Usuario)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a3a3a3' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a3a3a3' } }
    },
    plugins: { legend: { display: false } }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  // 📐 2. Configuración Gráfico de Pirámide Horizontal (Fluctuación Temporal de Comentarios)
  public piramideChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y', // 👈 Transforma las barras en horizontales para simular la pirámide
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#06b6d4', font: { family: 'monospace', size: 10 } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a1a1aa' } },
      y: { grid: { display: false }, ticks: { color: '#a1a1aa' } }
    }
  };
  public lineChartType: ChartType = 'bar';
  public lineChartData: ChartData<'bar'> = { labels: [], datasets: [] };


  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { color: '#e4e4e7', font: { size: 11 } } }
    }
  };
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = { labels: [], datasets: [] };


  ngOnInit(): void {
    this.cargarUsuariosDelSistema();
    this.cargarMetricasDelNexo();
  }

  private cargarUsuariosDelSistema() {
    this.usuariosService.listarUsuarios().subscribe({
      next: (users) => this.listaUsuarios.set(users)
    });
  }

  public usuariosFiltrados = computed(() => {
    const termino = this.busquedaAlias().toLowerCase().trim();
    if (!termino) return this.listaUsuarios();
    return this.listaUsuarios().filter(u =>
      u.nombreUsuario.toLowerCase().includes(termino) ||
      u.nombre.toLowerCase().includes(termino)
    );
  });

  public actualizarCampo(campo:  'usuario' | 'periodo', valor: string) {
  console.log(`[FRONTEND] Control alterado: ${campo} ->`, valor);
  if (campo === 'usuario') this.usuarioSeleccionado.set(valor);
  if (campo === 'periodo') this.periodoSeleccionado.set(valor);

  this.cargarMetricasDelNexo();
}

  public cargarMetricasDelNexo() {
    this.cargando.set(true);
    const usuarioId = this.usuarioSeleccionado() || undefined;
    const periodo = this.periodoSeleccionado() || 'mes';

  console.log('[FRONTEND HTTP PENDING] Parámetros reales enviados al Service:', { usuarioId: usuarioId, periodo });
    // 🧹 Vaciamos de inmediato para limpiar rastros visuales
    this.barChartData = { labels: [], datasets: [] };
    this.lineChartData = { labels: [], datasets: [] };
    this.pieChartData = { labels: [], datasets: [] };

    // 🔒 Sincronizamos las 3 llamadas concurrentes en un único flujo atómico
    forkJoin({
    publicaciones: this.statsService.getPublicacionesPorUsuario(usuarioId, periodo),
    comentarios: this.statsService.getComentariosTotales( usuarioId, periodo),
    distribucion: this.statsService.getComentariosPorPublicacion( usuarioId, periodo)
    }).subscribe({
      next: ({ publicaciones, comentarios, distribucion }) => {
        console.log('[FRONTEND HTTP SUCCESS] Datos crudos recibidos del Backend:', {
        publicacionesRecibidas: publicaciones.length,
        comentariosRecibidos: comentarios.length,
        distribucionRecibida: distribucion.length,
        detallesPublicaciones: publicaciones
        });

        // 1. Mapeo - Gráfico Barras
        this.barChartData = {
          labels: publicaciones.map(item => item.label),
          datasets: [{
            label: usuarioId ? 'Publicaciones en el Periodo' : 'Publicaciones Invocadas',
            data: publicaciones.map(item => item.value),
            backgroundColor: 'rgba(163, 0, 0, 0.4)',
            borderColor: this.colorBordeCarmesí,
            borderWidth: 2,
            hoverBackgroundColor: 'rgba(163, 0, 0, 0.7)'
          }]
        };

        // 2. Mapeo - Pirámide Horizontal
        this.lineChartData = {
          labels: comentarios.map(item => item.label),
          datasets: [{
            label: 'Comentarios Manifestados',
            data: comentarios.map(item => item.value),
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.3)',
            borderWidth: 1.5,
            hoverBackgroundColor: 'rgba(6, 182, 212, 0.6)'
          }]
        };

        // 3. Mapeo - Gráfico Pie
        this.pieChartData = {
          labels: distribucion.map(item => item.label),
          datasets: [{
            data: distribucion.map(item => item.value),
            backgroundColor: ['#a30000', '#06b6d4', '#eab308', '#a855f7', '#10b981'],
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)'
          }]
        };

        //  Apagamos el loader recién cuando TODO está listo en memoria
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando métricas del nexo:', err);
        this.cargando.set(false);
      }
    });
  }

  public limpiarFiltros() {
    this.usuarioSeleccionado.set('');
    this.busquedaAlias.set('');
    this.periodoSeleccionado.set('mes');
    this.cargarMetricasDelNexo();
  }

  public ejecutarBusquedaPorAlias() {
    const termino = this.busquedaAlias().toLowerCase().trim();

    if (!termino) {
      this.usuarioSeleccionado.set('');
      this.cargarMetricasDelNexo();
      return;
    }

    const coincidencia = this.listaUsuarios().find(u =>
      u.nombreUsuario.toLowerCase().includes(termino) ||
      u.nombre.toLowerCase().includes(termino)
    );

    if (coincidencia) {
      this.usuarioSeleccionado.set(coincidencia._id);
      this.cargarMetricasDelNexo();
    } else {
      this.usuarioSeleccionado.set('ID_INVALIDO_NEXO');
      this.cargarMetricasDelNexo();
    }
  }

  public obtenerNombreUsuarioAuditado(): string {
    const idSeleccionado = this.usuarioSeleccionado();
    if (!idSeleccionado) return 'Todos los Usuarios (Métricas Globales)';

    const usuario = this.listaUsuarios().find(u => u._id === idSeleccionado);
    return usuario ? `@${usuario.nombreUsuario} (${usuario.nombre})` : 'Usuario Desconocido';
  }
}
