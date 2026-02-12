import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito.service';
import { ItemCarrito } from '../../models/carrito.model';

/**
 * Componente del carrito de compras
 * Muestra items, permite ajustar cantidades y proceder al checkout
 */
@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent {
  items(): ItemCarrito[] {
    return this.carritoService.items();
  }

  total(): number {
    return this.carritoService.total();
  }

  cantidadTotal(): number {
    return this.carritoService.cantidadTotal();
  }

  isEmpty(): boolean {
    return this.carritoService.isEmpty();
  }

  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {}

  /**
   * Incrementar cantidad de un producto
   */
  incrementarCantidad(codeProduct: string): void {
    const success = this.carritoService.incrementarCantidad(codeProduct);
    if (!success) {
      alert('No hay más stock disponible');
    }
  }

  /**
   * Decrementar cantidad de un producto
   */
  decrementarCantidad(codeProduct: string): void {
    this.carritoService.decrementarCantidad(codeProduct);
  }

  /**
   * Actualizar cantidad directamente
   */
  actualizarCantidad(codeProduct: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const cantidad = parseInt(input.value, 10);

    if (isNaN(cantidad) || cantidad < 1) {
      input.value = '1';
      return;
    }

    const success = this.carritoService.actualizarCantidad(codeProduct, cantidad);
    if (!success) {
      const item = this.items().find(i => i.codeProduct === codeProduct);
      if (item) {
        input.value = item.cantidad.toString();
        alert(`Stock insuficiente. Máximo disponible: ${item.stockDisponible}`);
      }
    }
  }

  /**
   * Remover producto del carrito
   */
  removerProducto(item: ItemCarrito): void {
    if (confirm(`¿Remover "${item.nameProduct}" del carrito?`)) {
      this.carritoService.removerProducto(item.codeProduct);
    }
  }

  /**
   * Limpiar todo el carrito
   */
  limpiarCarrito(): void {
    if (confirm('¿Vaciar todo el carrito?')) {
      this.carritoService.limpiarCarrito();
    }
  }

  /**
   * Continuar comprando (volver al catálogo)
   */
  continuarComprando(): void {
    this.router.navigate(['/cliente/catalogo']);
  }

  /**
   * Proceder al checkout
   */
  procederAlCheckout(): void {
    this.router.navigate(['/cliente/checkout']);
  }

  /**
   * Verificar si se puede proceder al checkout
   */
  puedeCheckout(): boolean {
    return !this.isEmpty() && this.items().every(item => item.stockDisponible > 0);
  }

  /**
   * Obtener mensaje de advertencia si no se puede hacer checkout
   */
  getMensajeAdvertencia(): string | null {
    if (this.isEmpty()) {
      return null;
    }

    const itemsSinStock = this.items().filter(item => item.stockDisponible === 0);
    if (itemsSinStock.length > 0) {
      return `Algunos productos no tienen stock disponible. Por favor, elimínalos del carrito.`;
    }

    return null;
  }
}
