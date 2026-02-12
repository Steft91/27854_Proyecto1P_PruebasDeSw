import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EmpleadoService } from './empleado.service';
import { Empleado } from '../models';
import { environment } from '../../environments/environment';

describe('EmpleadoService', () => {
  let service: EmpleadoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/empleados`;

  const mockEmpleado: Empleado = {
    cedulaEmpleado: '1234567890',
    nombreEmpleado: 'María López',
    emailEmpleado: 'maria@test.com',
    celularEmpleado: '0987654321',
    direccionEmpleado: 'Avenida 456',
    sueldoEmpleado: 1500
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EmpleadoService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EmpleadoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('obtenerTodos', () => {
    it('should retrieve all empleados', () => {
      const mockEmpleados: Empleado[] = [
        mockEmpleado,
        { ...mockEmpleado, cedulaEmpleado: '0987654321', nombreEmpleado: 'Pedro Gómez' }
      ];

      service.obtenerTodos().subscribe(empleados => {
        expect(empleados.length).toBe(2);
        expect(empleados).toEqual(mockEmpleados);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockEmpleados);
    });
  });


  describe('crear', () => {
    it('should create a new empleado', () => {
      service.crear(mockEmpleado).subscribe(() => {
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('actualizar', () => {
    it('should update an existing empleado', () => {
      const empleadoActualizado: Empleado = {
        ...mockEmpleado,
        sueldoEmpleado: 1800
      };

      const expectedPayload = {
        newNombreEmpleado: 'María López',
        newEmailEmpleado: 'maria@test.com',
        newCelularEmpleado: '0987654321',
        newDireccionEmpleado: 'Avenida 456',
        newSueldoEmpleado: 1800
      };

      service.actualizar('1234567890', empleadoActualizado).subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/1234567890`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(expectedPayload);
      req.flush(null);
    });
  });

  describe('eliminar', () => {
    it('should delete an empleado', () => {
      service.eliminar('1234567890').subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/1234567890`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ msg: 'Empleado eliminado' });
    });
  });
});
