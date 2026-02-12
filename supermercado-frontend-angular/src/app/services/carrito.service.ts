import { Injectable, signal, computed } from '@angular/core';
import { ItemCarrito, Carrito, AgregarAlCarritoDTO } from '../models/carrito.model';

/**
 * Servicio para gestión del carrito de compras
 * Maneja estado reactivo con Signals y persistencia en localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private readonly STORAGE_KEY = 'carrito_items';

  // Estado reactivo del carrito
  private itemsSignal = signal<ItemCarrito[]>(this.loadFromStorage());

  // Computed signals para valores derivados
  public items = this.itemsSignal.asReadonly();

  public cantidadTotal = computed(() => {
    return this.itemsSignal().reduce((total, item) => total + item.cantidad, 0);
  });

  public total = computed(() => {
    return this.itemsSignal().reduce((total, item) => total + item.subtotal, 0);
  });

  public isEmpty = computed(() => {
    return this.itemsSignal().length === 0;
  });

  constructor() {}

  /**
   * Cargar items del localStorage al iniciar
   */
  private loadFromStorage(): ItemCarrito[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error al cargar carrito desde localStorage:', error);
    }
    return [];
  }

  /**
   * Guardar items en localStorage
   */
  private saveToStorage(items: ItemCarrito[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error al guardar carrito en localStorage:', error);
    }
  }

  /**
   * Calcular subtotal de un item
   */
  private calcularSubtotal(precio: number, cantidad: number): number {
    return Number((precio * cantidad).toFixed(2));
  }

  /**
   * Obtener el carrito completo
   */
  getCarrito(): Carrito {
    return {
      items: this.itemsSignal(),
      total: this.total(),
      cantidadTotal: this.cantidadTotal()
    };
  }

  /**
   * Agregar un producto al carrito
   * Si ya existe, incrementa la cantidad
   */
  agregarProducto(producto: AgregarAlCarritoDTO): boolean {
    const cantidad = producto.cantidad || 1;
    const items = [...this.itemsSignal()];

    // Buscar si el producto ya está en el carrito
    const existingIndex = items.findIndex(item => item.codeProduct === producto.codeProduct);

    if (existingIndex >= 0) {
      // Producto ya existe - incrementar cantidad
      const item = items[existingIndex];
      const nuevaCantidad = item.cantidad + cantidad;

      // Validar stock disponible
      if (nuevaCantidad > producto.stockDisponible) {
        console.warn('Stock insuficiente');
        return false;
      }

      items[existingIndex] = {
        ...item,
        cantidad: nuevaCantidad,
        stockDisponible: producto.stockDisponible,
        subtotal: this.calcularSubtotal(item.priceProduct, nuevaCantidad)
      };
    } else {
      // Producto nuevo - agregar al carrito
      if (cantidad > producto.stockDisponible) {
        console.warn('Stock insuficiente');
        return false;
      }

      const nuevoItem: ItemCarrito = {
        codeProduct: producto.codeProduct,
        nameProduct: producto.nameProduct,
        priceProduct: producto.priceProduct,
        cantidad: cantidad,
        stockDisponible: producto.stockDisponible,
        imageProduct: producto.imageProduct,
        subtotal: this.calcularSubtotal(producto.priceProduct, cantidad)
      };

      items.push(nuevoItem);
    }

    this.itemsSignal.set(items);
    this.saveToStorage(items);
    return true;
  }

  /**
   * Remover un producto del carrito
   */
  removerProducto(codeProduct: string): void {
    const items = this.itemsSignal().filter(item => item.codeProduct !== codeProduct);
    this.itemsSignal.set(items);
    this.saveToStorage(items);
  }

  /**
   * Actualizar la cantidad de un producto
   */
  actualizarCantidad(codeProduct: string, cantidad: number): boolean {
    if (cantidad < 1) {
      this.removerProducto(codeProduct);
      return true;
    }

    const items = [...this.itemsSignal()];
    const index = items.findIndex(item => item.codeProduct === codeProduct);

    if (index === -1) {
      return false;
    }

    const item = items[index];

    // Validar stock disponible
    if (cantidad > item.stockDisponible) {
      console.warn('Stock insuficiente');
      return false;
    }

    items[index] = {
      ...item,
      cantidad,
      subtotal: this.calcularSubtotal(item.priceProduct, cantidad)
    };

    this.itemsSignal.set(items);
    this.saveToStorage(items);
    return true;
  }

  /**
   * Incrementar cantidad de un producto en 1
   */
  incrementarCantidad(codeProduct: string): boolean {
    const item = this.itemsSignal().find(i => i.codeProduct === codeProduct);
    if (!item) return false;

    return this.actualizarCantidad(codeProduct, item.cantidad + 1);
  }

  /**
   * Decrementar cantidad de un producto en 1
   */
  decrementarCantidad(codeProduct: string): boolean {
    const item = this.itemsSignal().find(i => i.codeProduct === codeProduct);
    if (!item) return false;

    return this.actualizarCantidad(codeProduct, item.cantidad - 1);
  }

  /**
   * Limpiar todo el carrito
   */
  limpiarCarrito(): void {
    this.itemsSignal.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Obtener cantidad de un producto específico en el carrito
   */
  getCantidadProducto(codeProduct: string): number {
    const item = this.itemsSignal().find(i => i.codeProduct === codeProduct);
    return item ? item.cantidad : 0;
  }

  /**
   * Verificar si un producto está en el carrito
   */
  tieneProducto(codeProduct: string): boolean {
    return this.itemsSignal().some(item => item.codeProduct === codeProduct);
  }

  /**
   * Actualizar stock disponible de un producto
   * Útil cuando se actualiza la información del producto
   */
  actualizarStock(codeProduct: string, nuevoStock: number): void {
    const items = [...this.itemsSignal()];
    const index = items.findIndex(item => item.codeProduct === codeProduct);

    if (index !== -1) {
      items[index] = {
        ...items[index],
        stockDisponible: nuevoStock
      };

      // Si la cantidad actual excede el nuevo stock, ajustarla
      if (items[index].cantidad > nuevoStock) {
        if (nuevoStock === 0) {
          // Si no hay stock, remover del carrito
          items.splice(index, 1);
        } else {
          items[index].cantidad = nuevoStock;
          items[index].subtotal = this.calcularSubtotal(
            items[index].priceProduct,
            nuevoStock
          );
        }
      }

      this.itemsSignal.set(items);
      this.saveToStorage(items);
    }
  }
}
