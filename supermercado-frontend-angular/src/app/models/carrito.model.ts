/**
 * Modelos e interfaces para el carrito de compras
 */

/**
 * Item individual en el carrito
 */
export interface ItemCarrito {
  codeProduct: string;
  nameProduct: string;
  priceProduct: number;
  cantidad: number;
  stockDisponible: number;
  imageProduct?: string;
  subtotal: number;
}

/**
 * Estado completo del carrito
 */
export interface Carrito {
  items: ItemCarrito[];
  total: number;
  cantidadTotal: number;
}

/**
 * Datos para crear un item en el carrito (entrada)
 */
export interface AgregarAlCarritoDTO {
  codeProduct: string;
  nameProduct: string;
  priceProduct: number;
  stockDisponible: number;
  imageProduct?: string;
  cantidad?: number; // Default: 1
}
