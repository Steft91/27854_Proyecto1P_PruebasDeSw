import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { ItemCarrito } from '../../models/carrito.model';
import { PedidoService, CrearPedidoDTO, ItemPedido } from '../../services/pedido.service';

/**
 * Componente de checkout
 * Formulario de datos de entrega y confirmación de pedido
 */
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  items(): ItemCarrito[] {
    return this.carritoService.items();
  }

  total(): number {
    return this.carritoService.total();
  }

  cantidadTotal(): number {
    return this.carritoService.cantidadTotal();
  }

  // Datos del formulario
  direccion: string = '';
  telefono: string = '';
  notas: string = '';

  // Estado
  isProcessing: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private carritoService: CarritoService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirigir si el carrito está vacío
    if (this.carritoService.isEmpty()) {
      this.router.navigate(['/cliente/carrito']);
    }
  }

  /**
   * Validar formulario
   */
  validarFormulario(): boolean {
    if (!this.direccion.trim()) {
      this.errorMessage = 'La dirección es obligatoria';
      return false;
    }

    if (!this.telefono.trim()) {
      this.errorMessage = 'El teléfono es obligatorio';
      return false;
    }

    // Validación básica de teléfono (solo números y algunos caracteres)
    const telefonoRegex = /^[\d\s\-\+\(\)]+$/;
    if (!telefonoRegex.test(this.telefono)) {
      this.errorMessage = 'El teléfono solo debe contener números y caracteres válidos';
      return false;
    }

    this.errorMessage = null;
    return true;
  }

  /**
   * Confirmar pedido
   */
  confirmarPedido(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.isProcessing = true;
    this.errorMessage = null;

    // Preparar items para el pedido
    const itemsPedido: ItemPedido[] = this.items().map(item => ({
      producto: item.codeProduct,
      cantidad: item.cantidad
    }));

    // Preparar DTO del pedido
    const pedidoData: CrearPedidoDTO = {
      items: itemsPedido,
      datosEntrega: {
        direccion: this.direccion.trim(),
        telefono: this.telefono.trim(),
        notas: this.notas.trim() || undefined
      }
    };

    // Enviar pedido al backend
    this.pedidoService.crearPedido(pedidoData).subscribe({
      next: (response) => {
        console.log('Pedido creado exitosamente:', response);

        // Limpiar el carrito
        this.carritoService.limpiarCarrito();

        // Mostrar mensaje de éxito y redirigir
        alert(`¡Pedido realizado exitosamente!\n\nNúmero de pedido: ${response.pedido._id}\nTotal: $${response.pedido.total.toFixed(2)}`);

        // Redirigir a la página de pedidos
        this.router.navigate(['/cliente/pedidos']);
      },
      error: (error) => {
        console.error('Error al crear pedido:', error);
        this.isProcessing = false;

        if (error.error?.msg) {
          this.errorMessage = error.error.msg;
        } else if (error.status === 400) {
          this.errorMessage = 'Error en los datos del pedido. Verifica que todos los productos tengan stock disponible.';
        } else if (error.status === 401) {
          this.errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = 'Error al procesar el pedido. Por favor, intenta nuevamente.';
        }
      }
    });
  }

  /**
   * Volver al carrito
   */
  volverAlCarrito(): void {
    this.router.navigate(['/cliente/carrito']);
  }

  /**
   * Verificar si hay items sin stock
   */
  hayItemsSinStock(): boolean {
    return this.items().some(item => item.stockDisponible === 0);
  }
}
