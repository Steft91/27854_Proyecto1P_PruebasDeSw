import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProveedorService } from './proveedor.service';
import { Proveedor } from '../models';
import { environment } from '../../environments/environment';

describe('ProveedorService', () => {
  let service: ProveedorService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/providers`;

  const mockProveedor: Proveedor = {
    _id: '123',
    nombreFiscal: 'Tech Supplies Inc',
    rucNitNif: '1234567890001',
    direccionFisica: 'Zona Industrial 789',
    telefonoPrincipal: '+593987654321',
    correoElectronico: 'contacto@techsupplies.com',
    contactoNombre: 'Carlos Ramírez',
    contactoPuesto: 'Gerente de Ventas'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProveedorService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProveedorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('obtenerTodos', () => {
    it('should retrieve all proveedores', () => {
      const mockProveedores: Proveedor[] = [
        mockProveedor,
        { ...mockProveedor, _id: '456', rucNitNif: '0987654321001', nombreFiscal: 'Office Depot' }
      ];

      service.obtenerTodos().subscribe(proveedores => {
        expect(proveedores.length).toBe(2);
        expect(proveedores).toEqual(mockProveedores);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockProveedores);
    });
  });


  describe('crear', () => {
    it('should create a new proveedor', () => {
      const nuevoProveedor: Proveedor = {
        nombreFiscal: 'New Supplier SA',
        rucNitNif: '1111111111001',
        direccionFisica: 'Av Principal 123',
        telefonoPrincipal: '+593999888777',
        correoElectronico: 'info@newsupplier.com'
      };

      service.crear(nuevoProveedor).subscribe(proveedor => {
        expect(proveedor._id).toBe('123');
        expect(proveedor.nombreFiscal).toBe(nuevoProveedor.nombreFiscal);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoProveedor);
      req.flush({ ...nuevoProveedor, _id: '123' });
    });
  });

  describe('actualizar', () => {
    it('should update an existing proveedor', () => {
      const proveedorActualizado: Proveedor = {
        ...mockProveedor,
        telefonoPrincipal: '+593999999999'
      };

      const expectedPayload = {
        newNombreFiscal: mockProveedor.nombreFiscal,
        newRucNitNif: mockProveedor.rucNitNif,
        newDireccionFisica: mockProveedor.direccionFisica,
        newTelefonoPrincipal: '+593999999999',
        newCorreoElectronico: mockProveedor.correoElectronico,
        newContactoNombre: mockProveedor.contactoNombre,
        newContactoPuesto: mockProveedor.contactoPuesto
      };

      service.actualizar('1234567890001', proveedorActualizado).subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/1234567890001`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(expectedPayload);
      req.flush(null);
    });
  });

  describe('eliminar', () => {
    it('should delete a proveedor', () => {
      service.eliminar('1234567890001').subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/1234567890001`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ msg: 'Proveedor eliminado' });
    });
  });
});
