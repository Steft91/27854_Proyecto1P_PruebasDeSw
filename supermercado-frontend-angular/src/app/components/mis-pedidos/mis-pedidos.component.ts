import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PedidoService, Pedido } from '../../services/pedido.service';

/**
 * Componente de historial de pedidos del cliente
 * Muestra todos los pedidos realizados con filtros y acciones
 */
@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.css']
})
export class MisPedidosComponent implements OnInit {
  // 🔥 Estado reactivo con signals
  pedidos = signal<Pedido[]>([]);
  pedidosFiltrados = signal<Pedido[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Filtros
  filtroEstado = signal<string>('todos');

  constructor(
    private pedidoService: PedidoService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  /**
   * Cargar pedidos del usuario
   */
  cargarPedidos(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pedidoService.getMisPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos.set(pedidos);
        this.aplicarFiltros();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.errorMessage.set('Error al cargar tus pedidos');
        this.isLoading.set(false);

        if (error.status === 401) {
          this.errorMessage.set('Sesión expirada. Redirigiendo al login...');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      }
    });
  }

  /**
   * Aplicar filtros
   */
  aplicarFiltros(): void {
    const filtro = this.filtroEstado();
    const pedidosActuales = this.pedidos();

    if (filtro === 'todos') {
      this.pedidosFiltrados.set([...pedidosActuales]);
    } else {
      this.pedidosFiltrados.set(pedidosActuales.filter(p => p.estado === filtro));
    }
  }

  /**
   * Cambiar filtro de estado
   */
  cambiarFiltro(estado: string): void {
    this.filtroEstado.set(estado);
    this.aplicarFiltros();
  }

  /**
   * Ver detalle de un pedido
   */
  verDetalle(pedido: Pedido): void {
    this.router.navigate(['/cliente/pedidos', pedido._id]);
  }

  /**
   * Cancelar un pedido
   */
  cancelarPedido(pedido: Pedido, event: Event): void {
    event.stopPropagation(); // Evitar que se abra el detalle

    if (!confirm(`¿Estás seguro de cancelar el pedido #${pedido._id.slice(-8)}?`)) {
      return;
    }

    this.pedidoService.cancelarPedido(pedido._id).subscribe({
      next: (response) => {
        alert('Pedido cancelado exitosamente');
        // Actualizar el estado del pedido en la lista
        const pedidosActuales = this.pedidos();
        const index = pedidosActuales.findIndex(p => p._id === pedido._id);
        if (index !== -1) {
          const nuevosPedidos = [...pedidosActuales];
          nuevosPedidos[index] = response.pedido;
          this.pedidos.set(nuevosPedidos);
          this.aplicarFiltros();
        }
      },
      error: (error) => {
        console.error('Error al cancelar pedido:', error);
        alert(error.error?.msg || 'Error al cancelar el pedido');
      }
    });
  }

  /**
   * Verificar si un pedido se puede cancelar
   */
  puedeCancelar(pedido: Pedido): boolean {
    return pedido.estado === 'pendiente';
  }

  /**
   * Obtener clase CSS según estado
   */
  getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'pendiente': 'estado-pendiente',
      'procesando': 'estado-procesando',
      'completado': 'estado-completado',
      'cancelado': 'estado-cancelado'
    };
    return classes[estado] || '';
  }

  /**
   * Obtener texto del estado
   */
  getEstadoTexto(estado: string): string {
    const textos: Record<string, string> = {
      'pendiente': 'Pendiente',
      'procesando': 'En Proceso',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };
    return textos[estado] || estado;
  }

  /**
   * Obtener icono según estado
   */
  getEstadoIcon(estado: string): string {
    const iconos: Record<string, string> = {
      'pendiente': '⏱️',
      'procesando': '📦',
      'completado': '✅',
      'cancelado': '❌'
    };
    return iconos[estado] || '📋';
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: Date): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtener número de pedido corto
   */
  getNumeroPedido(id: string): string {
    return `#${id.slice(-8).toUpperCase()}`;
  }

  /**
   * Contar pedidos por estado
   */
  contarPorEstado(estado: string): number {
    const pedidosActuales = this.pedidos();
    if (estado === 'todos') return pedidosActuales.length;
    return pedidosActuales.filter(p => p.estado === estado).length;
  }
}
