import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/common';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let documentMock: any;
    const apiUrl = 'http://localhost:3000/api/auth';

    beforeEach(() => {
        documentMock = {
        location: {
            reload: jasmine.createSpy('reload')
        }
        };

        TestBed.configureTestingModule({
        providers: [
            AuthService,
            provideHttpClient(),
            provideHttpClientTesting(),
            { provide: DOCUMENT, useValue: documentMock }
        ]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
        
        localStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('LOGIN: debe enviar petición POST y guardar token', () => {
        const mockResponse = { token: 'fake-jwt-token', user: { username: 'admin' } };
        const credenciales = { username: 'admin', password: '123' };

        service.login(credenciales).subscribe(res => {
        expect(res.token).toBe('fake-jwt-token');
        expect(localStorage.getItem('token')).toBe('fake-jwt-token');
        });

        const req = httpMock.expectOne(`${apiUrl}/login`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });

    it('REGISTER: debe enviar petición POST de registro', () => {
        const nuevoUsuario = { username: 'new', email: 'n@n.com', password: '123' };

        service.register(nuevoUsuario).subscribe();

        const req = httpMock.expectOne(`${apiUrl}/register`);
        expect(req.request.method).toBe('POST');
        req.flush({ msg: 'Usuario creado' });
    });

    it('LOGOUT: debe limpiar token y recargar página', () => {
        localStorage.setItem('token', 'abc');
        
        service.logout();

        expect(localStorage.getItem('token')).toBeNull();
        expect(documentMock.location.reload).toHaveBeenCalled();
    });
});