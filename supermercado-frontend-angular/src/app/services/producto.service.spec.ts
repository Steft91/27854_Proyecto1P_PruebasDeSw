import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductoService } from './producto.service';
import { Producto } from '../models';
import { environment } from '../../environments/environment';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/products`;

  const mockProducto: Producto = {
    codeProduct: 'PROD-001',
    nameProduct: 'Laptop Dell',
    descriptionProduct: 'Laptop de alta gama',
    priceProduct: 1200,
    stockProduct: 15,
    proveedor: 'prov123'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductoService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('obtenerTodos', () => {
    it('should retrieve all productos', () => {
      const mockProductos: Producto[] = [
        mockProducto,
        { ...mockProducto, codeProduct: 'PROD-002', nameProduct: 'Mouse Logitech' }
      ];

      service.obtenerTodos().subscribe(productos => {
        expect(productos.length).toBe(2);
        expect(productos).toEqual(mockProductos);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockProductos);
    });
  });


  describe('crear', () => {
    it('should create a new producto', () => {
      service.crear(mockProducto).subscribe(() => {
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('actualizar', () => {
    it('should update an existing producto', () => {
      const productoActualizado: Producto = {
        ...mockProducto,
        priceProduct: 1100,
        stockProduct: 20
      };

      const expectedPayload = {
        newNameProduct: 'Laptop Dell',
        newDescriptionProduct: 'Laptop de alta gama',
        newPriceProduct: 1100,
        newStockProduct: 20,
        newProveedor: 'prov123'
      };

      service.actualizar('PROD-001', productoActualizado).subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/PROD-001`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(expectedPayload);
      req.flush(null);
    });
  });

  describe('eliminar', () => {
    it('should delete a producto', () => {
      service.eliminar('PROD-001').subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/PROD-001`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ msg: 'Producto eliminado' });
    });
  });
});
