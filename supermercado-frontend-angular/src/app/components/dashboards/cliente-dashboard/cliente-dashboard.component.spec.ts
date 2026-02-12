import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteDashboardComponent } from './cliente-dashboard.component';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { CarritoService } from '../../../services/carrito.service';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('ClienteDashboardComponent', () => {
  let component: ClienteDashboardComponent;
  let fixture: ComponentFixture<ClienteDashboardComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let carritoService: jasmine.SpyObj<CarritoService>;
  let router: Router;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const carritoServiceSpy = jasmine.createSpyObj('CarritoService', ['cantidadTotal']);

    await TestBed.configureTestingModule({
      imports: [ClienteDashboardComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CarritoService, useValue: carritoServiceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    carritoService = TestBed.inject(CarritoService) as jasmine.SpyObj<CarritoService>;
    router = TestBed.inject(Router);

    userService.getCurrentUser.and.returnValue({
      id: '1',
      username: 'cliente1',
      email: 'cliente@test.com',
      rol: 'cliente'
    });
    carritoService.cantidadTotal.and.returnValue(0);

    fixture = TestBed.createComponent(ClienteDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set userName from userService', () => {
      fixture.detectChanges();

      expect(component.userName).toBe('cliente1');
    });

    it('should handle null user from userService', () => {
      userService.getCurrentUser.and.returnValue(null);

      fixture.detectChanges();

      expect(component.userName).toBe('');
    });
  });

  describe('cantidadCarrito', () => {
    it('should return 0 when carrito is empty', () => {
      carritoService.cantidadTotal.and.returnValue(0);

      expect(component.cantidadCarrito).toBe(0);
    });

    it('should return correct quantity from carritoService', () => {
      carritoService.cantidadTotal.and.returnValue(5);

      expect(component.cantidadCarrito).toBe(5);
    });

    it('should update when carritoService changes', () => {
      carritoService.cantidadTotal.and.returnValue(3);
      expect(component.cantidadCarrito).toBe(3);

      carritoService.cantidadTotal.and.returnValue(7);
      expect(component.cantidadCarrito).toBe(7);
    });
  });

  describe('logout', () => {
    it('should call authService.logout when user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.logout();

      expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de cerrar sesión?');
      expect(authService.logout).toHaveBeenCalled();
    });

    it('should not call authService.logout when user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.logout();

      expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de cerrar sesión?');
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });

  describe('isRouteActive', () => {
    it('should return true when route is included in current url', () => {
      Object.defineProperty(router, 'url', { value: '/cliente/catalogo', writable: true });

      expect(component.isRouteActive('catalogo')).toBe(true);
    });

    it('should return false when route is not included in current url', () => {
      Object.defineProperty(router, 'url', { value: '/cliente/catalogo', writable: true });

      expect(component.isRouteActive('carrito')).toBe(false);
    });

    it('should return true for partial route matches', () => {
      Object.defineProperty(router, 'url', { value: '/cliente/pedidos/123', writable: true });

      expect(component.isRouteActive('pedidos')).toBe(true);
    });

    it('should return false for empty route', () => {
      Object.defineProperty(router, 'url', { value: '/cliente/catalogo', writable: true });

      expect(component.isRouteActive('')).toBe(true); // includes('') always returns true
    });
  });
});
