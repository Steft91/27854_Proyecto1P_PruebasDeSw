import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let httpMock: HttpTestingController;
  let documentMock: any;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    documentMock = {
      location: {
        reload: jasmine.createSpy('reload'),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        UserService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DOCUMENT, useValue: documentMock },
      ],
    });
    service = TestBed.inject(AuthService);
    userService = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send POST request and save token and user info', () => {
      const mockResponse = {
        token: 'fake-jwt-token',
        user: {
          id: '123',
          username: 'admin',
          email: 'admin@test.com',
          rol: 'administrador' as const
        }
      };
      const credenciales = { username: 'admin', password: '123' };

      service.login(credenciales).subscribe((res) => {
        expect(res.token).toBe('fake-jwt-token');
        expect(localStorage.getItem('token')).toBe('fake-jwt-token');

        // Verificar que se guardó la información del usuario
        const storedUser = userService.getCurrentUser();
        expect(storedUser).toBeTruthy();
        expect(storedUser?.username).toBe('admin');
        expect(storedUser?.rol).toBe('administrador');
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credenciales);
      req.flush(mockResponse);
    });

    it('should handle different user roles', () => {
      const mockEmpleadoResponse = {
        token: 'empleado-token',
        user: {
          id: '456',
          username: 'empleado1',
          email: 'empleado@test.com',
          rol: 'empleado' as const
        }
      };

      service.login({ username: 'empleado1', password: '123' }).subscribe(() => {
        const storedUser = userService.getCurrentUser();
        expect(storedUser?.rol).toBe('empleado');
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(mockEmpleadoResponse);
    });
  });

  describe('register', () => {
    it('should send POST request for registration', () => {
      const nuevoUsuario = {
        username: 'newuser',
        email: 'new@test.com',
        password: '123',
        role: 'cliente'
      };

      service.register(nuevoUsuario).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevoUsuario);
      req.flush({ msg: 'Usuario creado' });
    });
  });

  describe('logout', () => {
    it('should clear token, user info, and reload page', () => {
      // Setup: user logged in
      localStorage.setItem('token', 'abc-token');
      userService.setUser({
        id: '123',
        username: 'test',
        email: 'test@test.com',
        rol: 'cliente'
      });

      expect(localStorage.getItem('token')).toBeTruthy();
      expect(userService.getCurrentUser()).toBeTruthy();

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(userService.getCurrentUser()).toBeNull();
      expect(documentMock.location.reload).toHaveBeenCalled();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if token exists', () => {
      localStorage.setItem('token', 'some-token');
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('should return false if no token exists', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });
  });
});
