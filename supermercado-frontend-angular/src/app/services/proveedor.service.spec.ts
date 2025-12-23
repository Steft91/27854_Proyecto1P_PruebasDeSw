import { TestBed } from '@angular/core/testing';
import { ProveedorService } from './proveedor.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment.development';

describe('ProveedorService', () => {
    let service: ProveedorService;
    let httpMock: HttpTestingController;
    const apiUrl = `${environment.apiUrl}/providers`;

    beforeEach(() => {
        TestBed.configureTestingModule({
        providers: [ProveedorService, provideHttpClient(), provideHttpClientTesting()]
        });
        service = TestBed.inject(ProveedorService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('obtenerTodos: GET', () => {
        service.obtenerTodos().subscribe();
        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('crear: POST', () => {
        const mockData = { nombreFiscal: 'Prov', rucNitNif: '123' } as any;
        service.crear(mockData).subscribe();
        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('POST');
        req.flush({});
    });

    it('actualizar: PUT', () => {
        const id = '1';
        const mockData = { nombreFiscal: 'Edit', rucNitNif: '123' } as any;
        service.actualizar(id, mockData).subscribe();
        
        const req = httpMock.expectOne(`${apiUrl}/${id}`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(jasmine.objectContaining({
        newNombreFiscal: 'Edit'
        }));
        req.flush({});
    });

    it('eliminar: DELETE', () => {
        const id = '1';
        service.eliminar(id).subscribe();
        const req = httpMock.expectOne(`${apiUrl}/${id}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
    });
});