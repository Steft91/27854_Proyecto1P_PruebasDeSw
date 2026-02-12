import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministradorDashboardComponent } from './administrador-dashboard.component';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ClienteService } from '../../../services/cliente.service';
import { EmpleadoService } from '../../../services/empleado.service';
import { ProductoService } from '../../../services/producto.service';
import { ProveedorService } from '../../../services/proveedor.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('AdministradorDashboardComponent', () => {
  let component: AdministradorDashboardComponent;
  let fixture: ComponentFixture<AdministradorDashboardComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let clienteService: jasmine.SpyObj<ClienteService>;
  let empleadoService: jasmine.SpyObj<EmpleadoService>;
  let productoService: jasmine.SpyObj<ProductoService>;
  let proveedorService: jasmine.SpyObj<ProveedorService>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const clienteServiceSpy = jasmine.createSpyObj('ClienteService', ['obtenerTodos']);
    const empleadoServiceSpy = jasmine.createSpyObj('EmpleadoService', ['obtenerTodos']);
    const productoServiceSpy = jasmine.createSpyObj('ProductoService', ['obtenerTodos']);
    const proveedorServiceSpy = jasmine.createSpyObj('ProveedorService', ['obtenerTodos']);

    await TestBed.configureTestingModule({
      imports: [AdministradorDashboardComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ClienteService, useValue: clienteServiceSpy },
        { provide: EmpleadoService, useValue: empleadoServiceSpy },
        { provide: ProductoService, useValue: productoServiceSpy },
        { provide: ProveedorService, useValue: proveedorServiceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    clienteService = TestBed.inject(ClienteService) as jasmine.SpyObj<ClienteService>;
    empleadoService = TestBed.inject(EmpleadoService) as jasmine.SpyObj<EmpleadoService>;
    productoService = TestBed.inject(ProductoService) as jasmine.SpyObj<ProductoService>;
    proveedorService = TestBed.inject(ProveedorService) as jasmine.SpyObj<ProveedorService>;

    // Setup default return values
    clienteService.obtenerTodos.and.returnValue(of([]));
    empleadoService.obtenerTodos.and.returnValue(of([]));
    productoService.obtenerTodos.and.returnValue(of([]));
    proveedorService.obtenerTodos.and.returnValue(of([]));
    userService.getCurrentUser.and.returnValue({
      id: '1',
      username: 'admin',
      email: 'admin@test.com',
      rol: 'administrador'
    });

    fixture = TestBed.createComponent(AdministradorDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct nav items', () => {
    expect(component.navItems.length).toBe(4);
    expect(component.navItems[0].label).toBe('Clientes');
    expect(component.navItems[1].label).toBe('Empleados');
    expect(component.navItems[2].label).toBe('Productos');
    expect(component.navItems[3].label).toBe('Proveedores');
  });

  describe('ngOnInit', () => {
    it('should set userName and userRole from userService', () => {
      fixture.detectChanges();

      expect(component.userName()).toBe('admin');
      expect(component.userRole()).toBe('administrador');
    });

    it('should handle null user from userService', () => {
      userService.getCurrentUser.and.returnValue(null);

      fixture.detectChanges();

      expect(component.userName()).toBe('');
      expect(component.userRole()).toBe('administrador');
    });

    it('should call loadStats on init', () => {
      spyOn(component, 'loadStats');

      fixture.detectChanges();

      expect(component.loadStats).toHaveBeenCalled();
    });
  });

  describe('loadStats', () => {
    it('should load all statistics successfully', () => {
      const mockClientes = [
        { _id: '1', dniClient: '123', nameClient: 'Cliente 1' },
        { _id: '2', dniClient: '456', nameClient: 'Cliente 2' }
      ];
      const mockEmpleados = [
        { cedulaEmpleado: '789', nombreEmpleado: 'Empleado 1', celularEmpleado: '099999', sueldoEmpleado: 500 },
        { cedulaEmpleado: '012', nombreEmpleado: 'Empleado 2', celularEmpleado: '099998', sueldoEmpleado: 500 },
        { cedulaEmpleado: '345', nombreEmpleado: 'Empleado 3', celularEmpleado: '099997', sueldoEmpleado: 500 }
      ];
      const mockProductos = [
        { codeProduct: 'P1', nameProduct: 'Producto 1' }
      ];
      const mockProveedores = [
        { rucNitNif: '001', nombreFiscal: 'Proveedor 1', direccionFisica: 'Calle 1', telefonoPrincipal: '099999', correoElectronico: 'p1@test.com' },
        { rucNitNif: '002', nombreFiscal: 'Proveedor 2', direccionFisica: 'Calle 2', telefonoPrincipal: '099998', correoElectronico: 'p2@test.com' },
        { rucNitNif: '003', nombreFiscal: 'Proveedor 3', direccionFisica: 'Calle 3', telefonoPrincipal: '099997', correoElectronico: 'p3@test.com' },
        { rucNitNif: '004', nombreFiscal: 'Proveedor 4', direccionFisica: 'Calle 4', telefonoPrincipal: '099996', correoElectronico: 'p4@test.com' }
      ];

      clienteService.obtenerTodos.and.returnValue(of(mockClientes as any));
      empleadoService.obtenerTodos.and.returnValue(of(mockEmpleados));
      productoService.obtenerTodos.and.returnValue(of(mockProductos as any));
      proveedorService.obtenerTodos.and.returnValue(of(mockProveedores));

      fixture.detectChanges();

      expect(component.totalClientes()).toBe(2);
      expect(component.totalEmpleados()).toBe(3);
      expect(component.totalProductos()).toBe(1);
      expect(component.totalProveedores()).toBe(4);
    });

    it('should handle error loading clientes', () => {
      clienteService.obtenerTodos.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(component.totalClientes()).toBe(0);
      expect(console.error).toHaveBeenCalledWith('Error loading clientes:', jasmine.any(Error));
    });

    it('should handle error loading empleados', () => {
      empleadoService.obtenerTodos.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(component.totalEmpleados()).toBe(0);
      expect(console.error).toHaveBeenCalledWith('Error loading empleados:', jasmine.any(Error));
    });

    it('should handle error loading productos', () => {
      productoService.obtenerTodos.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(component.totalProductos()).toBe(0);
      expect(console.error).toHaveBeenCalledWith('Error loading productos:', jasmine.any(Error));
    });

    it('should handle error loading proveedores', () => {
      proveedorService.obtenerTodos.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(component.totalProveedores()).toBe(0);
      expect(console.error).toHaveBeenCalledWith('Error loading proveedores:', jasmine.any(Error));
    });
  });

  describe('onLogout', () => {
    it('should call authService.logout', () => {
      component.onLogout();

      expect(authService.logout).toHaveBeenCalled();
    });
  });
});
