import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { MisPedidosComponent } from './mis-pedidos.component';
import { PedidoService, Pedido } from '../../services/pedido.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('MisPedidosComponent', () => {
  let component: MisPedidosComponent;
  let fixture: ComponentFixture<MisPedidosComponent>;
  let pedidoService: jasmine.SpyObj<PedidoService>;
  let router: jasmine.SpyObj<Router>;

  const mockPedidos: Pedido[] = [
    {
      _id: 'abc123def456',
      usuario: 'user1',
      items: [
        { producto: 'P001', nombreProducto: 'Arroz', cantidad: 2, precioUnitario: 2.50, subtotal: 5.00 }
      ],
      total: 5.00,
      estado: 'pendiente',
      datosEntrega: { direccion: 'Calle 123', telefono: '0987654321' },
      createdAt: new Date('2025-01-15T10:30:00Z'),
      updatedAt: new Date('2025-01-15T10:30:00Z')
    },
    {
      _id: 'xyz789uvw012',
      usuario: 'user1',
      items: [
        { producto: 'P002', nombreProducto: 'Aceite', cantidad: 1, precioUnitario: 3.20, subtotal: 3.20 }
      ],
      total: 3.20,
      estado: 'completado',
      datosEntrega: { direccion: 'Av Principal', telefono: '0999888777' },
      createdAt: new Date('2025-01-10T15:00:00Z'),
      updatedAt: new Date('2025-01-10T15:00:00Z')
    },
    {
      _id: 'qwe456rty789',
      usuario: 'user1',
      items: [],
      total: 10.00,
      estado: 'procesando',
      datosEntrega: { direccion: 'Calle 456', telefono: '0987654321' },
      createdAt: new Date('2025-01-12T12:00:00Z'),
      updatedAt: new Date('2025-01-12T12:00:00Z')
    }
  ];

  beforeEach(async () => {
    const pedidoServiceSpy = jasmine.createSpyObj('PedidoService', [
      'getMisPedidos',
      'cancelarPedido'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [MisPedidosComponent],
      providers: [
        { provide: PedidoService, useValue: pedidoServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideRouter([])
      ]
    }).compileComponents();

    pedidoService = TestBed.inject(PedidoService) as jasmine.SpyObj<PedidoService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    pedidoService.getMisPedidos.and.returnValue(of(mockPedidos));

    fixture = TestBed.createComponent(MisPedidosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call cargarPedidos', () => {
      spyOn(component, 'cargarPedidos');

      fixture.detectChanges();

      expect(component.cargarPedidos).toHaveBeenCalled();
    });
  });

  describe('cargarPedidos', () => {
    it('should load pedidos successfully', () => {
      fixture.detectChanges();

      expect(component.pedidos().length).toBe(3);
      expect(component.pedidosFiltrados().length).toBe(3);
      expect(component.isLoading()).toBe(false);
      expect(component.errorMessage()).toBeNull();
    });

    it('should handle error loading pedidos', () => {
      pedidoService.getMisPedidos.and.returnValue(
        throwError(() => ({ status: 500 }))
      );
      spyOn(console, 'error');

      component.cargarPedidos();

      expect(component.errorMessage()).toBe('Error al cargar tus pedidos');
      expect(component.isLoading()).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle 401 error and redirect to login', fakeAsync(() => {
      pedidoService.getMisPedidos.and.returnValue(
        throwError(() => ({ status: 401 }))
      );

      component.cargarPedidos();

      expect(component.errorMessage()).toContain('Sesión expirada');

      tick(2000);

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));
  });

  describe('aplicarFiltros', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show all pedidos when filtro is "todos"', () => {
      component.filtroEstado.set('todos');

      component.aplicarFiltros();

      expect(component.pedidosFiltrados().length).toBe(3);
    });

    it('should filter by estado "pendiente"', () => {
      component.filtroEstado.set('pendiente');

      component.aplicarFiltros();

      expect(component.pedidosFiltrados().length).toBe(1);
      expect(component.pedidosFiltrados()[0].estado).toBe('pendiente');
    });

    it('should filter by estado "completado"', () => {
      component.filtroEstado.set('completado');

      component.aplicarFiltros();

      expect(component.pedidosFiltrados().length).toBe(1);
      expect(component.pedidosFiltrados()[0].estado).toBe('completado');
    });

    it('should return empty array when no pedidos match filter', () => {
      component.filtroEstado.set('cancelado');

      component.aplicarFiltros();

      expect(component.pedidosFiltrados().length).toBe(0);
    });
  });

  describe('cambiarFiltro', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should change filtroEstado and apply filters', () => {
      spyOn(component, 'aplicarFiltros');

      component.cambiarFiltro('completado');

      expect(component.filtroEstado()).toBe('completado');
      expect(component.aplicarFiltros).toHaveBeenCalled();
    });
  });

  describe('verDetalle', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to pedido detail', () => {
      component.verDetalle(mockPedidos[0]);

      expect(router.navigate).toHaveBeenCalledWith(['/cliente/pedidos', 'abc123def456']);
    });
  });

  describe('cancelarPedido', () => {
    let mockEvent: jasmine.SpyObj<Event>;

    beforeEach(() => {
      component.pedidos.set(mockPedidos);
      mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
    });

    it('should not cancel pedido when user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.cancelarPedido(mockPedidos[0], mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(pedidoService.cancelarPedido).not.toHaveBeenCalled();
    });

    it('should show error alert when cancelar fails', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      const errorResponse = {
        error: { msg: 'No se puede cancelar este pedido' }
      };
      pedidoService.cancelarPedido.and.returnValue(throwError(() => errorResponse));
      spyOn(console, 'error');

      component.cancelarPedido(mockPedidos[0], mockEvent);

      expect(window.alert).toHaveBeenCalledWith('No se puede cancelar este pedido');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('puedeCancelar', () => {
    it('should return true for pedido pendiente', () => {
      expect(component.puedeCancelar(mockPedidos[0])).toBe(true);
    });

    it('should return false for pedido completado', () => {
      expect(component.puedeCancelar(mockPedidos[1])).toBe(false);
    });

    it('should return false for pedido procesando', () => {
      expect(component.puedeCancelar(mockPedidos[2])).toBe(false);
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

  describe('contarPorEstado', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should count all pedidos for "todos"', () => {
      expect(component.contarPorEstado('todos')).toBe(3);
    });

    it('should count pedidos by specific estado', () => {
      expect(component.contarPorEstado('pendiente')).toBe(1);
      expect(component.contarPorEstado('completado')).toBe(1);
      expect(component.contarPorEstado('procesando')).toBe(1);
      expect(component.contarPorEstado('cancelado')).toBe(0);
    });
  });
});
