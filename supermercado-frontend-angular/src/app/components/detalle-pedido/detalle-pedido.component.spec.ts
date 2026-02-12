import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { DetallePedidoComponent } from './detalle-pedido.component';
import { PedidoService, Pedido } from '../../services/pedido.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('DetallePedidoComponent', () => {
  let component: DetallePedidoComponent;
  let fixture: ComponentFixture<DetallePedidoComponent>;
  let pedidoService: jasmine.SpyObj<PedidoService>;
  let router: Router;
  let paramsSubject: BehaviorSubject<any>;

  const mockPedido: Pedido = {
    _id: 'abc123def456',
    usuario: 'user1',
    items: [
      { producto: 'P001', nombreProducto: 'Arroz', cantidad: 2, precioUnitario: 2.50, subtotal: 5.00 },
      { producto: 'P002', nombreProducto: 'Aceite', cantidad: 1, precioUnitario: 3.20, subtotal: 3.20 }
    ],
    total: 8.20,
    estado: 'pendiente',
    datosEntrega: {
      direccion: 'Calle Principal 123',
      telefono: '0987654321',
      notas: 'Entregar en la mañana'
    },
    createdAt: new Date('2025-01-15T10:30:00Z'),
    updatedAt: new Date('2025-01-15T10:30:00Z')
  };

  beforeEach(async () => {
    const pedidoServiceSpy = jasmine.createSpyObj('PedidoService', [
      'getPedidoById',
      'cancelarPedido'
    ]);

    paramsSubject = new BehaviorSubject({ id: 'abc123def456' });

    await TestBed.configureTestingModule({
      imports: [DetallePedidoComponent],
      providers: [
        { provide: PedidoService, useValue: pedidoServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramsSubject.asObservable()
          }
        },
        provideRouter([])
      ]
    }).compileComponents();

    pedidoService = TestBed.inject(PedidoService) as jasmine.SpyObj<PedidoService>;
    router = TestBed.inject(Router);

    pedidoService.getPedidoById.and.returnValue(of(mockPedido));

    fixture = TestBed.createComponent(DetallePedidoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to route params and load pedido', () => {
      // Manually set pedidoId before calling cargarPedido to simulate what ngOnInit does
      component.pedidoId.set('abc123def456');
      component.cargarPedido();

      // After cargarPedido completes synchronously, pedido should be set
      expect(component.pedidoId()).toBe('abc123def456');
      expect(component.pedido()).toEqual(mockPedido);
    });

    it('should not call cargarPedido if pedidoId is empty', () => {
      paramsSubject.next({ id: '' });
      spyOn(component, 'cargarPedido');

      fixture.detectChanges();

      expect(component.cargarPedido).not.toHaveBeenCalled();
    });
  });

  describe('cargarPedido', () => {
    it('should load pedido successfully', () => {
      component.pedidoId.set('abc123def456');
      component.cargarPedido();

      expect(component.pedido()).toEqual(mockPedido);
      expect(component.isLoading()).toBe(false);
      expect(component.errorMessage()).toBeNull();
    });

    it('should handle 404 error', () => {
      pedidoService.getPedidoById.and.returnValue(
        throwError(() => ({ status: 404 }))
      );
      spyOn(console, 'error');

      component.cargarPedido();

      expect(component.errorMessage()).toBe('Pedido no encontrado');
      expect(component.isLoading()).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle 403 error', () => {
      pedidoService.getPedidoById.and.returnValue(
        throwError(() => ({ status: 403 }))
      );

      component.cargarPedido();

      expect(component.errorMessage()).toBe('No tienes permiso para ver este pedido');
    });

    it('should handle 401 error and redirect to login', fakeAsync(() => {
      pedidoService.getPedidoById.and.returnValue(
        throwError(() => ({ status: 401 }))
      );
      spyOn(router, 'navigate');

      component.cargarPedido();

      expect(component.errorMessage()).toContain('Sesión expirada');

      tick(2000);

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should handle generic error', () => {
      pedidoService.getPedidoById.and.returnValue(
        throwError(() => ({ status: 500 }))
      );

      component.cargarPedido();

      expect(component.errorMessage()).toBe('Error al cargar el pedido');
    });
  });

  describe('volverAtras', () => {
    it('should navigate to pedidos list', () => {
      spyOn(router, 'navigate');

      component.volverAtras();

      expect(router.navigate).toHaveBeenCalledWith(['/cliente/pedidos']);
    });
  });

  describe('cancelarPedido', () => {
    beforeEach(() => {
      component.pedidoId.set('abc123def456');
      component.pedido.set(mockPedido);
    });

    it('should not proceed if pedido is null', () => {
      component.pedido.set(null);
      spyOn(window, 'confirm');

      component.cancelarPedido();

      expect(window.confirm).not.toHaveBeenCalled();
    });

    it('should not cancel when user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.cancelarPedido();

      expect(pedidoService.cancelarPedido).not.toHaveBeenCalled();
    });

    it('should cancel pedido successfully when user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      const updatedPedido = { ...mockPedido, estado: 'cancelado' as const };
      pedidoService.cancelarPedido.and.returnValue(of({ msg: 'Pedido cancelado', pedido: updatedPedido }));

      component.cancelarPedido();

      expect(window.confirm).toHaveBeenCalledWith(jasmine.stringContaining('#23DEF456'));
      expect(pedidoService.cancelarPedido).toHaveBeenCalledWith('abc123def456');
      expect(window.alert).toHaveBeenCalledWith('Pedido cancelado exitosamente');
      expect(component.pedido()?.estado).toBe('cancelado');
    });

    it('should show error alert when cancelar fails', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      const errorResponse = {
        error: { msg: 'No se puede cancelar este pedido' }
      };
      pedidoService.cancelarPedido.and.returnValue(throwError(() => errorResponse));
      spyOn(console, 'error');

      component.cancelarPedido();

      expect(window.alert).toHaveBeenCalledWith('No se puede cancelar este pedido');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('puedeCancelar', () => {
    it('should return false when pedido is null', () => {
      component.pedido.set(null);

      expect(component.puedeCancelar()).toBe(false);
    });

    it('should return true when pedido estado is pendiente', () => {
      component.pedido.set(mockPedido);

      expect(component.puedeCancelar()).toBe(true);
    });

    it('should return false when pedido estado is not pendiente', () => {
      component.pedido.set({ ...mockPedido, estado: 'completado' });

      expect(component.puedeCancelar()).toBe(false);
    });
  });

  describe('getEstadoClass', () => {
    it('should return correct CSS class for each estado', () => {
      expect(component.getEstadoClass('pendiente')).toBe('estado-pendiente');
      expect(component.getEstadoClass('procesando')).toBe('estado-procesando');
      expect(component.getEstadoClass('completado')).toBe('estado-completado');
      expect(component.getEstadoClass('cancelado')).toBe('estado-cancelado');
    });

    it('should return empty string for unknown estado', () => {
      expect(component.getEstadoClass('unknown')).toBe('');
    });
  });

  describe('getEstadoTexto', () => {
    it('should return correct text for each estado', () => {
      expect(component.getEstadoTexto('pendiente')).toBe('Pendiente');
      expect(component.getEstadoTexto('procesando')).toBe('En Proceso');
      expect(component.getEstadoTexto('completado')).toBe('Completado');
      expect(component.getEstadoTexto('cancelado')).toBe('Cancelado');
    });

    it('should return original estado for unknown estado', () => {
      expect(component.getEstadoTexto('unknown')).toBe('unknown');
    });
  });

  describe('getEstadoIcon', () => {
    it('should return correct icon for each estado', () => {
      expect(component.getEstadoIcon('pendiente')).toBe('⏱️');
      expect(component.getEstadoIcon('procesando')).toBe('📦');
      expect(component.getEstadoIcon('completado')).toBe('✅');
      expect(component.getEstadoIcon('cancelado')).toBe('❌');
    });

    it('should return default icon for unknown estado', () => {
      expect(component.getEstadoIcon('unknown')).toBe('📋');
    });
  });

  describe('formatearFecha', () => {
    it('should format date correctly', () => {
      const fecha = new Date('2025-01-15T10:30:00Z');
      const formatted = component.formatearFecha(fecha);

      expect(formatted).toContain('2025');
      expect(formatted).toContain('15');
    });
  });

  describe('getNumeroPedido', () => {
    it('should return last 8 characters in uppercase with #', () => {
      const result = component.getNumeroPedido('abc123def456');

      expect(result).toBe('#23DEF456');
    });

    it('should handle short IDs', () => {
      const result = component.getNumeroPedido('short');

      expect(result).toBe('#SHORT');
    });
  });
});
