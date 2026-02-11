import { TestBed } from '@angular/core/testing';
import { ClienteService } from './cliente.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Cliente } from '../models';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/clients`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClienteService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('obtenerTodos: debe retornar lista de clientes (GET)', () => {
    const dummyClients: Cliente[] = [
      { dniClient: '1', nameClient: 'Juan', surnameClient: 'Perez' },
    ];

    service.obtenerTodos().subscribe((clientes) => {
      expect(clientes.length).toBe(1);
      expect(clientes).toEqual(dummyClients);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(dummyClients);
  });

  it('crear: debe enviar cliente nuevo (POST)', () => {
    const nuevoCliente: Cliente = { dniClient: '2', nameClient: 'Ana', surnameClient: 'G' };

    service.crear(nuevoCliente).subscribe((res) => {
      expect(res).toEqual(nuevoCliente);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(nuevoCliente);
    req.flush(nuevoCliente);
  });

  it('actualizar: debe enviar datos actualizados (PUT)', () => {
    const id = '123';
    const datos: Cliente = { dniClient: '123', nameClient: 'Editado', surnameClient: 'P' };

    service.actualizar(id, datos).subscribe((res) => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      newNameClient: datos.nameClient,
      newSurnameClient: datos.surnameClient,
      newAddressClient: datos.addressClient,
      newEmailClient: datos.emailClient,
      newPhoneClient: datos.phoneClient,
    });
    req.flush(null);
  });

  it('eliminar: debe enviar petición de borrado (DELETE)', () => {
    const id = '123';

    service.eliminar(id).subscribe((res) => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
