import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import {
  PedidoService,
  CrearPedidoDTO,
  Pedido,
  PedidoResponse,
  ItemPedidoDetalle
} from './pedido.service';
import { environment } from '../../environments/environment';

describe('PedidoService', () => {
  let service: PedidoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/pedidos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PedidoService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PedidoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('crearPedido', () => {
    it('should send POST request to create a pedido', () => {
      const mockPedidoDTO: CrearPedidoDTO = {
        items: [
          {
            producto: 'PROD-001',
            cantidad: 2
          }
        ],
        datosEntrega: {
          direccion: 'Calle 123',
          telefono: '123456789',
          notas: 'Entregar en la mañana'
        }
      };

      const mockItemDetalle: ItemPedidoDetalle = {
        producto: 'PROD-001',
        nombreProducto: 'Producto 1',
        cantidad: 2,
        precioUnitario: 100,
        subtotal: 200
      };

      const mockPedido: Pedido = {
        _id: 'pedido123',
        usuario: 'user123',
        items: [mockItemDetalle],
        total: 200,
        estado: 'pendiente',
        datosEntrega: mockPedidoDTO.datosEntrega,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockResponse: PedidoResponse = {
        msg: 'Pedido creado exitosamente',
        pedido: mockPedido
      };

      service.crearPedido(mockPedidoDTO).subscribe(response => {
        expect(response.msg).toBe('Pedido creado exitosamente');
        expect(response.pedido).toEqual(mockPedido);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPedidoDTO);
      req.flush(mockResponse);
    });
  });

  describe('getMisPedidos', () => {
    it('should send GET request to fetch user pedidos', () => {
      const mockPedidos: Pedido[] = [
        {
          _id: 'pedido1',
          usuario: 'user123',
          items: [],
          total: 100,
          estado: 'pendiente',
          datosEntrega: { direccion: 'Dir1', telefono: '123' },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'pedido2',
          usuario: 'user123',
          items: [],
          total: 200,
          estado: 'completado',
          datosEntrega: { direccion: 'Dir2', telefono: '456' },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      service.getMisPedidos().subscribe(pedidos => {
        expect(pedidos.length).toBe(2);
        expect(pedidos).toEqual(mockPedidos);
      });

      const req = httpMock.expectOne(`${apiUrl}/mis-pedidos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPedidos);
    });
  });

  describe('getPedidoById', () => {
    it('should send GET request to fetch a specific pedido', () => {
      const mockPedido: Pedido = {
        _id: 'pedido123',
        usuario: 'user123',
        items: [
          {
            producto: 'PROD-001',
            nombreProducto: 'Producto 1',
            cantidad: 2,
            precioUnitario: 100,
            subtotal: 200
          }
        ],
        total: 200,
        estado: 'pendiente',
        datosEntrega: { direccion: 'Calle 123', telefono: '123456789' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.getPedidoById('pedido123').subscribe(pedido => {
        expect(pedido).toEqual(mockPedido);
      });

      const req = httpMock.expectOne(`${apiUrl}/pedido123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPedido);
    });
  });

  describe('getTodosPedidos', () => {
    it('should send GET request to fetch all pedidos (admin/empleado)', () => {
      const mockPedidos: Pedido[] = [
        {
          _id: 'pedido1',
          usuario: 'user1',
          items: [],
          total: 100,
          estado: 'pendiente',
          datosEntrega: { direccion: 'Dir1', telefono: '123' },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'pedido2',
          usuario: 'user2',
          items: [],
          total: 200,
          estado: 'completado',
          datosEntrega: { direccion: 'Dir2', telefono: '456' },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      service.getTodosPedidos().subscribe(pedidos => {
        expect(pedidos.length).toBe(2);
        expect(pedidos).toEqual(mockPedidos);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPedidos);
    });
  });

  describe('actualizarEstadoPedido', () => {
    it('should send PUT request to update pedido status', () => {
      const mockPedido: Pedido = {
        _id: 'pedido123',
        usuario: 'user123',
        items: [],
        total: 200,
        estado: 'completado',
        datosEntrega: { direccion: 'Dir', telefono: '123' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockResponse: PedidoResponse = {
        msg: 'Estado actualizado',
        pedido: mockPedido
      };

      service.actualizarEstadoPedido('pedido123', 'completado').subscribe(response => {
        expect(response.msg).toBe('Estado actualizado');
        expect(response.pedido.estado).toBe('completado');
      });

      const req = httpMock.expectOne(`${apiUrl}/pedido123/estado`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ estado: 'completado' });
      req.flush(mockResponse);
    });
  });

  describe('cancelarPedido', () => {
    it('should send PUT request to cancel pedido', () => {
      const mockPedido: Pedido = {
        _id: 'pedido123',
        usuario: 'user123',
        items: [],
        total: 200,
        estado: 'cancelado',
        datosEntrega: { direccion: 'Dir', telefono: '123' },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockResponse: PedidoResponse = {
        msg: 'Pedido cancelado',
        pedido: mockPedido
      };

      service.cancelarPedido('pedido123').subscribe(response => {
        expect(response.msg).toBe('Pedido cancelado');
        expect(response.pedido.estado).toBe('cancelado');
      });

      const req = httpMock.expectOne(`${apiUrl}/pedido123/cancelar`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });
});
