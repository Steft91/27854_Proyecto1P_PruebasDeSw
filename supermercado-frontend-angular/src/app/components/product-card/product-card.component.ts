import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models';
import { CarritoService } from '../../services/carrito.service';

/**
 * Componente de tarjeta de producto
 * Muestra la información del producto y permite agregarlo al carrito
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() producto!: Producto;
  @Output() productoAgregado = new EventEmitter<Producto>();

  constructor(private carritoService: CarritoService) {}

  /**
   * Agregar producto al carrito
   */
  agregarAlCarrito(): void {
    const success = this.carritoService.agregarProducto({
      codeProduct: this.producto.codeProduct,
      nameProduct: this.producto.nameProduct,
      priceProduct: this.producto.priceProduct,
      stockDisponible: this.producto.stockProduct,
      cantidad: 1
    });

    if (success) {
      this.productoAgregado.emit(this.producto);
    }
  }

  /**
   * Verificar si el producto está en el carrito
   */
  estaEnCarrito(): boolean {
    return this.carritoService.tieneProducto(this.producto.codeProduct);
  }

  /**
   * Obtener cantidad en el carrito
   */
  getCantidadEnCarrito(): number {
    return this.carritoService.getCantidadProducto(this.producto.codeProduct);
  }

  /**
   * Verificar si hay stock disponible
   */
  hayStock(): boolean {
    return this.producto.stockProduct > 0;
  }

  /**
   * Obtener clase CSS según disponibilidad de stock
   */
  getStockClass(): string {
    if (this.producto.stockProduct === 0) {
      return 'sin-stock';
    } else if (this.producto.stockProduct < 5) {
      return 'stock-bajo';
    } else {
      return 'stock-disponible';
    }
  }

  /**
   * Obtener texto de stock
   */
  getStockText(): string {
    if (this.producto.stockProduct === 0) {
      return 'Sin stock';
    } else if (this.producto.stockProduct < 5) {
      return `Últimas ${this.producto.stockProduct} unidades`;
    } else {
      return `${this.producto.stockProduct} disponibles`;
    }
  }
}
