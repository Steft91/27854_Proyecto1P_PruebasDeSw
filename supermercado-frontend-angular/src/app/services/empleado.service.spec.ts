import { TestBed } from '@angular/core/testing';
import { EmpleadoService } from './empleado.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('EmpleadoService', () => {
  let service: EmpleadoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/empleados`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmpleadoService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmpleadoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('obtenerTodos: debe retornar lista (GET)', () => {
    // Arrange: no specific setup needed, service and httpMock are already initialized

    // Act
    service.obtenerTodos().subscribe();
    const req = httpMock.expectOne(apiUrl);

    // Assert
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('crear: debe enviar datos (POST)', () => {
    // Arrange
    const mockData = { cedulaEmpleado: '1', nombreEmpleado: 'A' } as any;

    // Act
    service.crear(mockData).subscribe();
    const req = httpMock.expectOne(apiUrl);

    // Assert
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('actualizar: debe enviar datos transformados (PUT)', () => {
    // Arrange
    const id = '1';
    const mockData = { nombreEmpleado: 'B' } as any;

    // Act
    service.actualizar(id, mockData).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/${id}`);

    // Assert
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(
      jasmine.objectContaining({
        newNombreEmpleado: 'B',
      }),
    );
    req.flush({});
  });

  it('eliminar: debe borrar (DELETE)', () => {
    // Arrange
    const id = '1';

    // Act
    service.eliminar(id).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/${id}`);

    // Assert
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
