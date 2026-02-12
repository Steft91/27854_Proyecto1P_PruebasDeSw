import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ClienteService } from './cliente.service';
import { Cliente } from '../models';
import { environment } from '../../environments/environment';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/clients`;

  const mockCliente: Cliente = {
    _id: '123',
    dniClient: '1234567890',
    nameClient: 'Juan',
    surnameClient: 'Pérez',
    emailClient: 'juan@test.com',
    phoneClient: '0987654321',
    addressClient: 'Calle 123'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClienteService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('obtenerTodos', () => {
    it('should retrieve all clientes', () => {
      const mockClientes: Cliente[] = [
        mockCliente,
        { ...mockCliente, _id: '456', dniClient: '0987654321' }
      ];

      service.obtenerTodos().subscribe(clientes => {
        expect(clientes.length).toBe(2);
        expect(clientes).toEqual(mockClientes);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockClientes);
    });
  });

  describe('crear', () => {
    it('should create a new cliente', () => {
      const nuevoCliente: Cliente = {
        dniClient: '1234567890',
        nameClient: 'Juan',
        surnameClient: 'Pérez',
        emailClient: 'juan@test.com',
        phoneClient: '0987654321',
        addressClient: 'Calle 123'
      };

      service.crear(nuevoCliente).subscribe(cliente => {
        expect(cliente._id).toBe('123');
        expect(cliente.dniClient).toBe(nuevoCliente.dniClient);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoCliente);
      req.flush(mockCliente);
    });
  });

  describe('actualizar', () => {
    it('should update an existing cliente', () => {
      const clienteActualizado: Cliente = {
        ...mockCliente,
        nameClient: 'Juan Carlos'
      };

      const expectedPayload = {
        newNameClient: 'Juan Carlos',
        newSurnameClient: 'Pérez',
        newAddressClient: 'Calle 123',
        newEmailClient: 'juan@test.com',
        newPhoneClient: '0987654321'
      };

      service.actualizar('1234567890', clienteActualizado).subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/1234567890`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(expectedPayload);
      req.flush(null);
    });
  });

  describe('eliminar', () => {
    it('should delete a cliente', () => {
      service.eliminar('1234567890').subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/1234567890`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ msg: 'Cliente eliminado' });
    });
  });
});
