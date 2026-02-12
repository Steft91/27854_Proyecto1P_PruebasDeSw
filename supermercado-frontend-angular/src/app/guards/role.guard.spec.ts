import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleGuard } from './role.guard';
import { UserService } from '../services/user.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('roleGuard', () => {
  let userService: UserService;
  let router: Router;
  let mockRoute: any;
  let mockState: any;

  beforeEach(() => {
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: Router, useValue: routerMock }
      ]
    });

    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);

    mockRoute = { data: {} } as any;
    mockState = { url: '/test' } as any;

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should redirect to login if user is not authenticated', () => {
    mockRoute.data = { roles: ['administrador'] };

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(mockRoute, mockState)
    );

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/test' } });
  });

  it('should allow access if user has required role', () => {
    userService.setUser({
      id: '123',
      username: 'admin',
      email: 'admin@test.com',
      rol: 'administrador'
    });

    mockRoute.data = { roles: ['administrador'] };

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(mockRoute, mockState)
    );

    expect(result).toBeTrue();
  });

  it('should allow access if user has one of multiple required roles', () => {
    userService.setUser({
      id: '123',
      username: 'empleado',
      email: 'emp@test.com',
      rol: 'empleado'
    });

    mockRoute.data = { roles: ['administrador', 'empleado'] };

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(mockRoute, mockState)
    );

    expect(result).toBeTrue();
  });

  it('should deny access and redirect to appropriate dashboard if user lacks role', () => {
    userService.setUser({
      id: '123',
      username: 'cliente',
      email: 'cliente@test.com',
      rol: 'cliente'
    });

    mockRoute.data = { roles: ['administrador', 'empleado'] };

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(mockRoute, mockState)
    );

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/cliente']);
  });
});
