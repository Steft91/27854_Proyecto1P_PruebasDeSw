import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { ToastService } from '../services/toast.service';
import { UserService } from '../services/user.service';

describe('errorInterceptor', () => {
  let toastService: ToastService;
  let router: Router;
  let userService: UserService;
  let httpHandler: HttpHandler;

  beforeEach(() => {
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        UserService,
        { provide: Router, useValue: routerMock }
      ]
    });

    toastService = TestBed.inject(ToastService);
    router = TestBed.inject(Router);
    userService = TestBed.inject(UserService);

    httpHandler = {
      handle: jasmine.createSpy('handle')
    } as any;

    spyOn(toastService, 'error');
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should show error toast for 403 Forbidden error', (done) => {
    const error403 = new HttpErrorResponse({
      error: { message: 'Forbidden' },
      status: 403,
      statusText: 'Forbidden'
    });

    const request = new HttpRequest('GET', '/api/test');

    (httpHandler.handle as jasmine.Spy).and.returnValue(throwError(() => error403));

    TestBed.runInInjectionContext(() => {
      const interceptorFn = errorInterceptor;
      const result$ = interceptorFn(request, httpHandler.handle.bind(httpHandler));

      result$.subscribe({
        error: (err) => {
          expect(toastService.error).toHaveBeenCalledWith(
            'No tienes permisos para realizar esta acción'
          );
          expect(err).toBe(error403);
          done();
        }
      });
    });
  });

  it('should clear user and redirect to login for 401 Unauthorized error', (done) => {
    userService.setUser({
      id: '123',
      username: 'test',
      email: 'test@test.com',
      rol: 'cliente'
    });

    const error401 = new HttpErrorResponse({
      error: { message: 'Unauthorized' },
      status: 401,
      statusText: 'Unauthorized'
    });

    const request = new HttpRequest('GET', '/api/test');

    (httpHandler.handle as jasmine.Spy).and.returnValue(throwError(() => error401));

    TestBed.runInInjectionContext(() => {
      const interceptorFn = errorInterceptor;
      const result$ = interceptorFn(request, httpHandler.handle.bind(httpHandler));

      result$.subscribe({
        error: (err) => {
          expect(toastService.error).toHaveBeenCalledWith('Sesión expirada. Por favor, inicia sesión nuevamente.');
          expect(userService.getCurrentUser()).toBeNull();
          expect(localStorage.getItem('token')).toBeNull();
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          expect(err).toBe(error401);
          done();
        }
      });
    });
  });

  it('should show generic error for 500 Server Error', (done) => {
    const error500 = new HttpErrorResponse({
      error: { message: 'Internal Server Error' },
      status: 500,
      statusText: 'Internal Server Error'
    });

    const request = new HttpRequest('GET', '/api/test');

    (httpHandler.handle as jasmine.Spy).and.returnValue(throwError(() => error500));

    TestBed.runInInjectionContext(() => {
      const interceptorFn = errorInterceptor;
      const result$ = interceptorFn(request, httpHandler.handle.bind(httpHandler));

      result$.subscribe({
        error: (err) => {
          expect(toastService.error).toHaveBeenCalledWith(
            'Error del servidor. Por favor, intenta más tarde.'
          );
          expect(err).toBe(error500);
          done();
        }
      });
    });
  });

  it('should show network error message for status 0', (done) => {
    const networkError = new HttpErrorResponse({
      error: new ErrorEvent('Network error'),
      status: 0,
      statusText: 'Unknown Error'
    });

    const request = new HttpRequest('GET', '/api/test');

    (httpHandler.handle as jasmine.Spy).and.returnValue(throwError(() => networkError));

    TestBed.runInInjectionContext(() => {
      const interceptorFn = errorInterceptor;
      const result$ = interceptorFn(request, httpHandler.handle.bind(httpHandler));

      result$.subscribe({
        error: (err) => {
          expect(toastService.error).toHaveBeenCalledWith(
            'Error de conexión. Verifica tu internet.'
          );
          expect(err).toBe(networkError);
          done();
        }
      });
    });
  });

  it('should show specific error message if provided by server', (done) => {
    const error400 = new HttpErrorResponse({
      error: { message: 'Validation failed' },
      status: 400,
      statusText: 'Bad Request'
    });

    const request = new HttpRequest('POST', '/api/test', {});

    (httpHandler.handle as jasmine.Spy).and.returnValue(throwError(() => error400));

    TestBed.runInInjectionContext(() => {
      const interceptorFn = errorInterceptor;
      const result$ = interceptorFn(request, httpHandler.handle.bind(httpHandler));

      result$.subscribe({
        error: (err) => {
          expect(toastService.error).toHaveBeenCalledWith('Validation failed');
          expect(err).toBe(error400);
          done();
        }
      });
    });
  });

  it('should pass through successful responses without interference', (done) => {
    const successResponse = new HttpResponse({
      body: { data: 'success' },
      status: 200
    });

    const request = new HttpRequest('GET', '/api/test');

    (httpHandler.handle as jasmine.Spy).and.returnValue(of(successResponse));

    TestBed.runInInjectionContext(() => {
      const interceptorFn = errorInterceptor;
      const result$ = interceptorFn(request, httpHandler.handle.bind(httpHandler));

      result$.subscribe({
        next: (response) => {
          expect(toastService.error).not.toHaveBeenCalled();
          expect(response).toBe(successResponse);
          done();
        }
      });
    });
  });
});
