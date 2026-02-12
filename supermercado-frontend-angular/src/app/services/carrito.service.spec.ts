import { TestBed } from '@angular/core/testing';
import { CarritoService } from './carrito.service';
import { ItemCarrito, AgregarAlCarritoDTO } from '../models/carrito.model';

describe('CarritoService', () => {
  let service: CarritoService;

  const mockProductoDTO1: AgregarAlCarritoDTO = {
    codeProduct: 'PROD-001',
    nameProduct: 'Producto 1',
    priceProduct: 100,
    stockDisponible: 10,
    cantidad: 2
  };

  const mockProductoDTO2: AgregarAlCarritoDTO = {
    codeProduct: 'PROD-002',
    nameProduct: 'Producto 2',
    priceProduct: 200,
    stockDisponible: 5,
    cantidad: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CarritoService]
    });
    service = TestBed.inject(CarritoService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('agregarProducto', () => {
    it('should add a new product to the cart', () => {
      const result = service.agregarProducto(mockProductoDTO1);

      expect(result).toBeTrue();
      const items = service.items();
      expect(items.length).toBe(1);
      expect(items[0].codeProduct).toBe('PROD-001');
      expect(items[0].cantidad).toBe(2);
      expect(items[0].subtotal).toBe(200);
    });

    it('should increment quantity if product already exists in cart', () => {
      service.agregarProducto({ ...mockProductoDTO1, cantidad: 1 });
      service.agregarProducto({ ...mockProductoDTO1, cantidad: 2 });

      const items = service.items();
      expect(items.length).toBe(1);
      expect(items[0].cantidad).toBe(3);
      expect(items[0].subtotal).toBe(300);
    });

    it('should add multiple different products', () => {
      service.agregarProducto(mockProductoDTO1);
      service.agregarProducto(mockProductoDTO2);

      const items = service.items();
      expect(items.length).toBe(2);
    });

    it('should persist cart to localStorage', () => {
      service.agregarProducto(mockProductoDTO1);

      const stored = localStorage.getItem('carrito_items');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1);
    });

    it('should return false if stock is insufficient', () => {
      const result = service.agregarProducto({
        ...mockProductoDTO1,
        cantidad: 20,
        stockDisponible: 10
      });

      expect(result).toBeFalse();
      expect(service.items().length).toBe(0);
    });
  });

  describe('removerProducto', () => {
    it('should remove a product from the cart', () => {
      service.agregarProducto(mockProductoDTO1);
      service.agregarProducto(mockProductoDTO2);

      service.removerProducto('PROD-001');

      const items = service.items();
      expect(items.length).toBe(1);
      expect(items[0].codeProduct).toBe('PROD-002');
    });

    it('should do nothing if product does not exist', () => {
      service.agregarProducto(mockProductoDTO1);

      service.removerProducto('PROD-999');

      const items = service.items();
      expect(items.length).toBe(1);
    });
  });

  describe('actualizarCantidad', () => {
    it('should update the quantity of a product', () => {
      service.agregarProducto(mockProductoDTO1);

      const result = service.actualizarCantidad('PROD-001', 5);

      expect(result).toBeTrue();
      const items = service.items();
      expect(items[0].cantidad).toBe(5);
      expect(items[0].subtotal).toBe(500);
    });

    it('should remove product if quantity is set to 0', () => {
      service.agregarProducto(mockProductoDTO1);

      service.actualizarCantidad('PROD-001', 0);

      const items = service.items();
      expect(items.length).toBe(0);
    });

    it('should return false if product does not exist', () => {
      service.agregarProducto(mockProductoDTO1);

      const result = service.actualizarCantidad('PROD-999', 5);

      expect(result).toBeFalse();
    });

    it('should return false if quantity exceeds stock', () => {
      service.agregarProducto(mockProductoDTO1);

      const result = service.actualizarCantidad('PROD-001', 20);

      expect(result).toBeFalse();
      expect(service.items()[0].cantidad).toBe(2);
    });
  });

  describe('limpiarCarrito', () => {
    it('should clear all items from cart', () => {
      service.agregarProducto(mockProductoDTO1);
      service.agregarProducto(mockProductoDTO2);

      service.limpiarCarrito();

      expect(service.items().length).toBe(0);
      expect(service.total()).toBe(0);
      expect(localStorage.getItem('carrito_items')).toBeNull();
    });
  });

  describe('cantidadTotal', () => {
    it('should return the total number of items', () => {
      service.agregarProducto({ ...mockProductoDTO1, cantidad: 2 });
      service.agregarProducto({ ...mockProductoDTO2, cantidad: 3 });

      expect(service.cantidadTotal()).toBe(5);
    });

    it('should return 0 if cart is empty', () => {
      expect(service.cantidadTotal()).toBe(0);
    });
  });

  describe('total', () => {
    it('should calculate total correctly', () => {
      service.agregarProducto({ ...mockProductoDTO1, cantidad: 2 });
      service.agregarProducto({ ...mockProductoDTO2, cantidad: 1 });

      expect(service.total()).toBe(400);
    });

    it('should update total when items change', () => {
      service.agregarProducto({ ...mockProductoDTO1, cantidad: 1 });
      expect(service.total()).toBe(100);

      service.agregarProducto({ ...mockProductoDTO1, cantidad: 1 });
      expect(service.total()).toBe(200);

      service.removerProducto('PROD-001');
      expect(service.total()).toBe(0);
    });
  });

  describe('getCantidadProducto', () => {
    it('should return quantity of specific product', () => {
      service.agregarProducto({ ...mockProductoDTO1, cantidad: 3 });

      expect(service.getCantidadProducto('PROD-001')).toBe(3);
    });

    it('should return 0 if product is not in cart', () => {
      expect(service.getCantidadProducto('PROD-999')).toBe(0);
    });
  });

  describe('tieneProducto', () => {
    it('should return true if product is in cart', () => {
      service.agregarProducto(mockProductoDTO1);

      expect(service.tieneProducto('PROD-001')).toBeTrue();
    });

    it('should return false if product is not in cart', () => {
      expect(service.tieneProducto('PROD-999')).toBeFalse();
    });
  });

  describe('localStorage persistence', () => {
    it('should load cart from localStorage on service creation', () => {
      const mockItems: ItemCarrito[] = [
        {
          codeProduct: 'PROD-001',
          nameProduct: 'Producto 1',
          priceProduct: 100,
          cantidad: 2,
          stockDisponible: 10,
          subtotal: 200
        }
      ];

      localStorage.setItem('carrito_items', JSON.stringify(mockItems));

      const newService = new CarritoService();

      expect(newService.items().length).toBe(1);
      expect(newService.items()[0].codeProduct).toBe('PROD-001');
      expect(newService.total()).toBe(200);
    });

    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorage.setItem('carrito_items', 'invalid-json{');

      const newService = new CarritoService();

      expect(newService.items().length).toBe(0);
      expect(newService.total()).toBe(0);
    });
  });

  describe('getCarrito', () => {
    it('should return complete cart object', () => {
      service.agregarProducto({ ...mockProductoDTO1, cantidad: 2 });
      service.agregarProducto({ ...mockProductoDTO2, cantidad: 1 });

      const carrito = service.getCarrito();

      expect(carrito.items.length).toBe(2);
      expect(carrito.total).toBe(400);
      expect(carrito.cantidadTotal).toBe(3);
    });
  });
});
