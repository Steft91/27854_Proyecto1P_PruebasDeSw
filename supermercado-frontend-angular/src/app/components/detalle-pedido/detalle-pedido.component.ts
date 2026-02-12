import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService, Pedido } from '../../services/pedido.service';

/**
 * Componente de detalle de pedido
 * Muestra información completa de un pedido específico
 */
@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-pedido.component.html',
  styleUrls: ['./detalle-pedido.component.css']
})
export class DetallePedidoComponent implements OnInit {
  // 🔥 Estado reactivo con signals
  pedido = signal<Pedido | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  pedidoId = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.pedidoId.set(params['id']);
      if (this.pedidoId()) {
        this.cargarPedido();
      }
    });
  }

  /**
   * Cargar detalles del pedido
   */
  cargarPedido(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pedidoService.getPedidoById(this.pedidoId()).subscribe({
      next: (pedido) => {
        this.pedido.set(pedido);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar pedido:', error);
        this.isLoading.set(false);

        if (error.status === 404) {
          this.errorMessage.set('Pedido no encontrado');
        } else if (error.status === 403) {
          this.errorMessage.set('No tienes permiso para ver este pedido');
        } else if (error.status === 401) {
          this.errorMessage.set('Sesión expirada. Redirigiendo al login...');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage.set('Error al cargar el pedido');
        }
      }
    });
  }

  /**
   * Volver a mis pedidos
   */
  volverAtras(): void {
    this.router.navigate(['/cliente/pedidos']);
  }

  /**
   * Cancelar pedido
   */
  cancelarPedido(): void {
    const pedidoActual = this.pedido();
    if (!pedidoActual) return;

    if (!confirm(`¿Estás seguro de cancelar el pedido #${this.getNumeroPedido(pedidoActual._id)}?`)) {
      return;
    }

    this.pedidoService.cancelarPedido(pedidoActual._id).subscribe({
      next: (response) => {
        alert('Pedido cancelado exitosamente');
        this.pedido.set(response.pedido);
      },
      error: (error) => {
        console.error('Error al cancelar pedido:', error);
        alert(error.error?.msg || 'Error al cancelar el pedido');
      }
    });
  }

  /**
   * Verificar si se puede cancelar
   */
  puedeCancelar(): boolean {
    return this.pedido()?.estado === 'pendiente' || false;
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
}
