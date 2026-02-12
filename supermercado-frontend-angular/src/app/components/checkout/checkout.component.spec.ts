import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CheckoutComponent } from './checkout.component';
import { CarritoService } from '../../services/carrito.service';
import { PedidoService } from '../../services/pedido.service';
import { Router } from '@angular/router';
import { ItemCarrito } from '../../models/carrito.model';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let carritoService: jasmine.SpyObj<CarritoService>;
  let pedidoService: jasmine.SpyObj<PedidoService>;
  let router: jasmine.SpyObj<Router>;

  const mockItems: ItemCarrito[] = [
    {
      codeProduct: 'P001',
      nameProduct: 'Arroz',
      priceProduct: 2.50,
      cantidad: 2,
      stockDisponible: 100,
      subtotal: 5.00
    },
    {
      codeProduct: 'P002',
      nameProduct: 'Aceite',
      priceProduct: 3.20,
      cantidad: 1,
      stockDisponible: 50,
      subtotal: 3.20
    }
  ];

  beforeEach(async () => {
    const carritoServiceSpy = jasmine.createSpyObj('CarritoService', [
      'items',
      'total',
      'cantidadTotal',
      'isEmpty',
      'limpiarCarrito'
    ]);
    const pedidoServiceSpy = jasmine.createSpyObj('PedidoService', ['crearPedido']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        { provide: CarritoService, useValue: carritoServiceSpy },
        { provide: PedidoService, useValue: pedidoServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideRouter([])
      ]
    }).compileComponents();

    carritoService = TestBed.inject(CarritoService) as jasmine.SpyObj<CarritoService>;
    pedidoService = TestBed.inject(PedidoService) as jasmine.SpyObj<PedidoService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Default mock returns
    carritoService.items.and.returnValue(mockItems);
    carritoService.total.and.returnValue(8.20);
    carritoService.cantidadTotal.and.returnValue(3);
    carritoService.isEmpty.and.returnValue(false);

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to carrito when carrito is empty', () => {
      carritoService.isEmpty.and.returnValue(true);

      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith(['/cliente/carrito']);
    });

    it('should not redirect when carrito has items', () => {
      carritoService.isEmpty.and.returnValue(false);

      fixture.detectChanges();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Getter methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return items from carritoService', () => {
      expect(component.items()).toEqual(mockItems);
    });

    it('should return total from carritoService', () => {
      expect(component.total()).toBe(8.20);
    });

    it('should return cantidadTotal from carritoService', () => {
      expect(component.cantidadTotal()).toBe(3);
    });
  });

  describe('validarFormulario', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return false when direccion is empty', () => {
      component.direccion = '';
      component.telefono = '0987654321';

      const result = component.validarFormulario();

      expect(result).toBe(false);
      expect(component.errorMessage).toBe('La dirección es obligatoria');
    });

    it('should return false when telefono is empty', () => {
      component.direccion = 'Calle 123';
      component.telefono = '';

      const result = component.validarFormulario();

      expect(result).toBe(false);
      expect(component.errorMessage).toBe('El teléfono es obligatorio');
    });

    it('should return false when telefono has invalid characters', () => {
      component.direccion = 'Calle 123';
      component.telefono = 'abc123xyz';

      const result = component.validarFormulario();

      expect(result).toBe(false);
      expect(component.errorMessage).toContain('solo debe contener números');
    });

    it('should return true when all fields are valid', () => {
      component.direccion = 'Calle 123';
      component.telefono = '0987654321';

      const result = component.validarFormulario();

      expect(result).toBe(true);
      expect(component.errorMessage).toBeNull();
    });

    it('should accept telefono with spaces, dashes, and parentheses', () => {
      component.direccion = 'Calle 123';
      component.telefono = '+593 (099) 876-5432';

      const result = component.validarFormulario();

      expect(result).toBe(true);
    });
  });

  describe('confirmarPedido', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.direccion = 'Calle Principal 123';
      component.telefono = '0987654321';
      component.notas = 'Entregar en la mañana';
    });

    it('should not proceed if form is invalid', () => {
      component.direccion = '';

      component.confirmarPedido();

      expect(pedidoService.crearPedido).not.toHaveBeenCalled();
    });

    it('should create pedido successfully', () => {
      const mockResponse = {
        msg: 'Pedido creado exitosamente',
        pedido: {
          _id: '12345',
          usuario: 'user1',
          items: [{ producto: 'P001', nombreProducto: 'Arroz', cantidad: 2, precioUnitario: 2.50, subtotal: 5.00 }],
          total: 8.20,
          estado: 'pendiente' as const,
          datosEntrega: { direccion: 'Calle 123', telefono: '0987654321' },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      pedidoService.crearPedido.and.returnValue(of(mockResponse));
      spyOn(window, 'alert');
      spyOn(console, 'log');

      component.confirmarPedido();

      expect(component.isProcessing).toBe(true);
      expect(pedidoService.crearPedido).toHaveBeenCalledWith({
        items: [
          { producto: 'P001', cantidad: 2 },
          { producto: 'P002', cantidad: 1 }
        ],
        datosEntrega: {
          direccion: 'Calle Principal 123',
          telefono: '0987654321',
          notas: 'Entregar en la mañana'
        }
      });
      expect(carritoService.limpiarCarrito).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('¡Pedido realizado exitosamente!'));
      expect(router.navigate).toHaveBeenCalledWith(['/cliente/pedidos']);
    });

    it('should handle empty notas', () => {
      component.notas = '';
      const mockResponse = {
        msg: 'Pedido creado exitosamente',
        pedido: {
          _id: '12345',
          usuario: 'user1',
          items: [],
          total: 8.20,
          estado: 'pendiente' as const,
          datosEntrega: { direccion: 'Calle 123', telefono: '0987654321' },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      pedidoService.crearPedido.and.returnValue(of(mockResponse));
      spyOn(window, 'alert');

      component.confirmarPedido();

      const callArgs = pedidoService.crearPedido.calls.mostRecent().args[0];
      expect(callArgs.datosEntrega.notas).toBeUndefined();
    });

    it('should handle error with custom message', () => {
      const errorResponse = {
        error: { msg: 'Stock insuficiente para el producto P001' },
        status: 400
      };
      pedidoService.crearPedido.and.returnValue(throwError(() => errorResponse));
      spyOn(console, 'error');

      component.confirmarPedido();

      expect(component.isProcessing).toBe(false);
      expect(component.errorMessage).toBe('Stock insuficiente para el producto P001');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle 400 error with default message', () => {
      const errorResponse = {
        error: {},
        status: 400
      };
      pedidoService.crearPedido.and.returnValue(throwError(() => errorResponse));

      component.confirmarPedido();

      expect(component.errorMessage).toContain('Error en los datos del pedido');
    });

    it('should handle 401 error and redirect to login', fakeAsync(() => {
      const errorResponse = {
        error: {},
        status: 401
      };
      pedidoService.crearPedido.and.returnValue(throwError(() => errorResponse));

      component.confirmarPedido();

      expect(component.errorMessage).toContain('Sesión expirada');

      tick(2000);

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should handle generic error', () => {
      const errorResponse = {
        error: {},
        status: 500
      };
      pedidoService.crearPedido.and.returnValue(throwError(() => errorResponse));

      component.confirmarPedido();

      expect(component.errorMessage).toContain('Error al procesar el pedido');
    });
  });

  describe('volverAlCarrito', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to carrito', () => {
      component.volverAlCarrito();

      expect(router.navigate).toHaveBeenCalledWith(['/cliente/carrito']);
    });
  });

  describe('hayItemsSinStock', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return false when all items have stock', () => {
      carritoService.items.and.returnValue(mockItems);

      expect(component.hayItemsSinStock()).toBe(false);
    });

    it('should return true when some items have no stock', () => {
      const itemsSinStock = [
        { ...mockItems[0] },
        { ...mockItems[1], stockDisponible: 0 }
      ];
      carritoService.items.and.returnValue(itemsSinStock);

      expect(component.hayItemsSinStock()).toBe(true);
    });

    it('should return false when items array is empty', () => {
      carritoService.items.and.returnValue([]);

      expect(component.hayItemsSinStock()).toBe(false);
    });
  });
});
