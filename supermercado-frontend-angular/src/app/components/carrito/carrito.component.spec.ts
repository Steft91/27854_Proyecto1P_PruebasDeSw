import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarritoComponent } from './carrito.component';
import { CarritoService } from '../../services/carrito.service';
import { Router } from '@angular/router';
import { ItemCarrito } from '../../models/carrito.model';
import { provideRouter } from '@angular/router';

describe('CarritoComponent', () => {
  let component: CarritoComponent;
  let fixture: ComponentFixture<CarritoComponent>;
  let carritoService: jasmine.SpyObj<CarritoService>;
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
      'incrementarCantidad',
      'decrementarCantidad',
      'actualizarCantidad',
      'removerProducto',
      'limpiarCarrito'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CarritoComponent],
      providers: [
        { provide: CarritoService, useValue: carritoServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideRouter([])
      ]
    }).compileComponents();

    carritoService = TestBed.inject(CarritoService) as jasmine.SpyObj<CarritoService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    carritoService.items.and.returnValue(mockItems);
    carritoService.total.and.returnValue(8.20);
    carritoService.cantidadTotal.and.returnValue(3);
    carritoService.isEmpty.and.returnValue(false);

    fixture = TestBed.createComponent(CarritoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Getter methods', () => {
    it('should return items from carritoService', () => {
      expect(component.items()).toEqual(mockItems);
    });

    it('should return total from carritoService', () => {
      expect(component.total()).toBe(8.20);
    });

    it('should return cantidadTotal from carritoService', () => {
      expect(component.cantidadTotal()).toBe(3);
    });

    it('should return isEmpty from carritoService', () => {
      expect(component.isEmpty()).toBe(false);
    });
  });

  describe('incrementarCantidad', () => {
    it('should call carritoService.incrementarCantidad when successful', () => {
      carritoService.incrementarCantidad.and.returnValue(true);

      component.incrementarCantidad('P001');

      expect(carritoService.incrementarCantidad).toHaveBeenCalledWith('P001');
    });

    it('should show alert when incrementing fails due to insufficient stock', () => {
      carritoService.incrementarCantidad.and.returnValue(false);
      spyOn(window, 'alert');

      component.incrementarCantidad('P001');

      expect(window.alert).toHaveBeenCalledWith('No hay más stock disponible');
    });
  });

  describe('decrementarCantidad', () => {
    it('should call carritoService.decrementarCantidad', () => {
      component.decrementarCantidad('P001');

      expect(carritoService.decrementarCantidad).toHaveBeenCalledWith('P001');
    });
  });

  describe('actualizarCantidad', () => {
    it('should update cantidad when valid number provided', () => {
      carritoService.actualizarCantidad.and.returnValue(true);
      const event = { target: { value: '5' } } as any;

      component.actualizarCantidad('P001', event);

      expect(carritoService.actualizarCantidad).toHaveBeenCalledWith('P001', 5);
    });

    it('should reset input to 1 when invalid number provided', () => {
      const mockInput = { value: 'abc' };
      const event = { target: mockInput } as any;

      component.actualizarCantidad('P001', event);

      expect(mockInput.value).toBe('1');
      expect(carritoService.actualizarCantidad).not.toHaveBeenCalled();
    });

    it('should reset input to 1 when number less than 1 provided', () => {
      const mockInput = { value: '0' };
      const event = { target: mockInput } as any;

      component.actualizarCantidad('P001', event);

      expect(mockInput.value).toBe('1');
      expect(carritoService.actualizarCantidad).not.toHaveBeenCalled();
    });

    it('should show alert and reset input when insufficient stock', () => {
      carritoService.actualizarCantidad.and.returnValue(false);
      const mockInput = { value: '200' };
      const event = { target: mockInput } as any;
      spyOn(window, 'alert');

      component.actualizarCantidad('P001', event);

      expect(mockInput.value).toBe('2'); // Reset to current cantidad
      expect(window.alert).toHaveBeenCalledWith('Stock insuficiente. Máximo disponible: 100');
    });
  });

  describe('removerProducto', () => {
    it('should remove producto when user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.removerProducto(mockItems[0]);

      expect(window.confirm).toHaveBeenCalledWith('¿Remover "Arroz" del carrito?');
      expect(carritoService.removerProducto).toHaveBeenCalledWith('P001');
    });

    it('should not remove producto when user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.removerProducto(mockItems[0]);

      expect(window.confirm).toHaveBeenCalledWith('¿Remover "Arroz" del carrito?');
      expect(carritoService.removerProducto).not.toHaveBeenCalled();
    });
  });

  describe('limpiarCarrito', () => {
    it('should clear carrito when user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.limpiarCarrito();

      expect(window.confirm).toHaveBeenCalledWith('¿Vaciar todo el carrito?');
      expect(carritoService.limpiarCarrito).toHaveBeenCalled();
    });

    it('should not clear carrito when user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.limpiarCarrito();

      expect(window.confirm).toHaveBeenCalledWith('¿Vaciar todo el carrito?');
      expect(carritoService.limpiarCarrito).not.toHaveBeenCalled();
    });
  });

  describe('continuarComprando', () => {
    it('should navigate to catalogo', () => {
      component.continuarComprando();

      expect(router.navigate).toHaveBeenCalledWith(['/cliente/catalogo']);
    });
  });

  describe('procederAlCheckout', () => {
    it('should navigate to checkout', () => {
      component.procederAlCheckout();

      expect(router.navigate).toHaveBeenCalledWith(['/cliente/checkout']);
    });
  });

  describe('puedeCheckout', () => {
    it('should return true when carrito has items with stock', () => {
      carritoService.isEmpty.and.returnValue(false);
      carritoService.items.and.returnValue(mockItems);

      expect(component.puedeCheckout()).toBe(true);
    });

    it('should return false when carrito is empty', () => {
      carritoService.isEmpty.and.returnValue(true);
      carritoService.items.and.returnValue([]);

      expect(component.puedeCheckout()).toBe(false);
    });

    it('should return false when some items have no stock', () => {
      const itemsSinStock = [
        { ...mockItems[0] },
        { ...mockItems[1], stockDisponible: 0 }
      ];
      carritoService.isEmpty.and.returnValue(false);
      carritoService.items.and.returnValue(itemsSinStock);

      expect(component.puedeCheckout()).toBe(false);
    });
  });

  describe('getMensajeAdvertencia', () => {
    it('should return null when carrito is empty', () => {
      carritoService.isEmpty.and.returnValue(true);
      carritoService.items.and.returnValue([]);

      expect(component.getMensajeAdvertencia()).toBeNull();
    });

    it('should return warning message when items have no stock', () => {
      const itemsSinStock = [
        { ...mockItems[0], stockDisponible: 0 }
      ];
      carritoService.isEmpty.and.returnValue(false);
      carritoService.items.and.returnValue(itemsSinStock);

      const mensaje = component.getMensajeAdvertencia();
      expect(mensaje).toContain('Algunos productos no tienen stock disponible');
    });

    it('should return null when all items have stock', () => {
      carritoService.isEmpty.and.returnValue(false);
      carritoService.items.and.returnValue(mockItems);

      expect(component.getMensajeAdvertencia()).toBeNull();
    });
  });
});
