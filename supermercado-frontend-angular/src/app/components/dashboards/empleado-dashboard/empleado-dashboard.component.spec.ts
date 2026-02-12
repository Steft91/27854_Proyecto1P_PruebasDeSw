import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpleadoDashboardComponent } from './empleado-dashboard.component';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ClienteService } from '../../../services/cliente.service';
import { ProductoService } from '../../../services/producto.service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('EmpleadoDashboardComponent', () => {
  let component: EmpleadoDashboardComponent;
  let fixture: ComponentFixture<EmpleadoDashboardComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let clienteService: jasmine.SpyObj<ClienteService>;
  let productoService: jasmine.SpyObj<ProductoService>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const clienteServiceSpy = jasmine.createSpyObj('ClienteService', ['obtenerTodos']);
    const productoServiceSpy = jasmine.createSpyObj('ProductoService', ['obtenerTodos']);

    await TestBed.configureTestingModule({
      imports: [EmpleadoDashboardComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ClienteService, useValue: clienteServiceSpy },
        { provide: ProductoService, useValue: productoServiceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    clienteService = TestBed.inject(ClienteService) as jasmine.SpyObj<ClienteService>;
    productoService = TestBed.inject(ProductoService) as jasmine.SpyObj<ProductoService>;

    clienteService.obtenerTodos.and.returnValue(of([]));
    productoService.obtenerTodos.and.returnValue(of([]));
    userService.getCurrentUser.and.returnValue({
      id: '1',
      username: 'empleado1',
      email: 'emp@test.com',
      rol: 'empleado'
    });

    fixture = TestBed.createComponent(EmpleadoDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct nav items', () => {
    expect(component.navItems.length).toBe(2);
    expect(component.navItems[0].label).toBe('Clientes');
    expect(component.navItems[1].label).toBe('Productos');
  });

  describe('ngOnInit', () => {
    it('should set userName and userRole from userService', () => {
      fixture.detectChanges();

      expect(component.userName()).toBe('empleado1');
      expect(component.userRole()).toBe('empleado');
    });

    it('should handle null user from userService', () => {
      userService.getCurrentUser.and.returnValue(null);

      fixture.detectChanges();

      expect(component.userName()).toBe('');
      expect(component.userRole()).toBe('empleado');
    });

    it('should call loadStats on init', () => {
      spyOn(component, 'loadStats');

      fixture.detectChanges();

      expect(component.loadStats).toHaveBeenCalled();
    });
  });

  describe('loadStats', () => {
    it('should load statistics successfully', () => {
      const mockClientes = [
        { _id: '1', dniClient: '123', nameClient: 'Cliente 1' },
        { _id: '2', dniClient: '456', nameClient: 'Cliente 2' },
        { _id: '3', dniClient: '789', nameClient: 'Cliente 3' }
      ];
      const mockProductos = [
        { codeProduct: 'P1', nameProduct: 'Producto 1' },
        { codeProduct: 'P2', nameProduct: 'Producto 2' }
      ];

      clienteService.obtenerTodos.and.returnValue(of(mockClientes as any));
      productoService.obtenerTodos.and.returnValue(of(mockProductos as any));

      fixture.detectChanges();

      expect(component.totalClientes()).toBe(3);
      expect(component.totalProductos()).toBe(2);
    });

    it('should handle error loading clientes', () => {
      clienteService.obtenerTodos.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(component.totalClientes()).toBe(0);
      expect(console.error).toHaveBeenCalledWith('Error loading clientes:', jasmine.any(Error));
    });

    it('should handle error loading productos', () => {
      productoService.obtenerTodos.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(component.totalProductos()).toBe(0);
      expect(console.error).toHaveBeenCalledWith('Error loading productos:', jasmine.any(Error));
    });
  });

  describe('onLogout', () => {
    it('should call authService.logout', () => {
      component.onLogout();

      expect(authService.logout).toHaveBeenCalled();
    });
  });
});
