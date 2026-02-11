import { TestBed } from '@angular/core/testing';
import { ProductoService } from './producto.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Producto } from '../models';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductoService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('obtenerTodos: debe retornar productos (GET)', () => {
    const dummyProds: Producto[] = [
      {
        codeProduct: 'P1',
        nameProduct: 'A',
        descriptionProduct: 'D',
        priceProduct: 10,
        stockProduct: 5,
      },
    ];

    service.obtenerTodos().subscribe((prods) => {
      expect(prods.length).toBe(1);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(dummyProds);
  });

  it('crear: debe enviar producto (POST)', () => {
    const nuevoProd: Producto = {
      codeProduct: 'P2',
      nameProduct: 'B',
      descriptionProduct: 'D',
      priceProduct: 20,
      stockProduct: 10,
    };

    service.crear(nuevoProd).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevoProd);
    req.flush(nuevoProd);
  });

  it('actualizar: debe enviar actualización (PUT)', () => {
    const id = 'P1';
    const datos: Producto = {
      codeProduct: 'P1',
      nameProduct: 'Edit',
      descriptionProduct: 'D',
      priceProduct: 10,
      stockProduct: 5,
    };

    service.actualizar(id, datos).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      newNameProduct: datos.nameProduct,
      newDescriptionProduct: datos.descriptionProduct,
      newPriceProduct: datos.priceProduct,
      newStockProduct: datos.stockProduct,
      newProveedor: datos.proveedor,
    });
    req.flush({});
  });

  it('eliminar: debe borrar producto (DELETE)', () => {
    const id = 'P1';
    service.eliminar(id).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
