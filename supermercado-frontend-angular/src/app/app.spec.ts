import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './services/auth.service';
import { ClienteService } from './services/cliente.service';
import { ProveedorService } from './services/proveedor.service';
import { ProductoService } from './services/producto.service';
import { EmpleadoService } from './services/empleado.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { AuthResponse } from './models';

describe('App Component', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let crudServiceMock: any;

  beforeAll(() => {
    Object.defineProperty(window, 'scrollTo', { value: jasmine.createSpy('scrollTo') });
  });

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'login', 'logout']);

    authServiceMock.isLoggedIn.and.returnValue(false);

    const mockAuthResponse: AuthResponse = { 
      token: 'mock-token-default', 
      user: { id: '1', username: 'test', email: 'test@test.com', rol: 'admin' } 
    };
    authServiceMock.login.and.returnValue(of(mockAuthResponse));
    
    authServiceMock.logout.and.stub();

    crudServiceMock = jasmine.createSpyObj('CrudService', ['obtenerTodos', 'crear', 'actualizar', 'eliminar']);
    crudServiceMock.obtenerTodos.and.returnValue(of([])); 
    crudServiceMock.crear.and.returnValue(of({})); 
    crudServiceMock.actualizar.and.returnValue(of({}));
    crudServiceMock.eliminar.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [App, FormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ClienteService, useValue: crudServiceMock },
        { provide: ProveedorService, useValue: crudServiceMock },
        { provide: ProductoService, useValue: crudServiceMock },
        { provide: EmpleadoService, useValue: crudServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  describe('Cuando NO está autenticado', () => {
    beforeEach(() => {
      authServiceMock.isLoggedIn.and.returnValue(false);
      fixture.detectChanges();
    });

    it('Debe mostrar el formulario de login', () => {
      const loginForm = fixture.debugElement.query(By.css('form'));
      expect(loginForm).toBeTruthy();
      expect(component.isAuthenticated).toBeFalse();
    });

    it('Debe validar campos vacíos en onLogin', () => {
      component.loginData = { username: '', password: '' };
      component.onLogin();
      
      expect(component.loginError).toContain('completa todos los campos');
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('Debe manejar error del servidor al hacer login', () => {
      component.loginData = { username: 'admin', password: '123' };
      const errorResponse = { error: { msg: 'Usuario no encontrado' } };
      authServiceMock.login.and.returnValue(throwError(() => errorResponse));

      component.onLogin();

      expect(authServiceMock.login).toHaveBeenCalled();
      expect(component.loginError).toBe('Usuario no encontrado');
      expect(component.isAuthenticated).toBeFalse();
    });

    it('Debe manejar error genérico de conexión al hacer login', () => {
      component.loginData = { username: 'admin', password: '123' };
      authServiceMock.login.and.returnValue(throwError(() => ({ status: 500 })));

      component.onLogin();

      expect(component.loginError).toContain('Credenciales incorrectas o error');
    });

    it('Debe iniciar sesión correctamente (Happy Path)', () => {
      component.loginData = { username: 'admin', password: '123' };
      authServiceMock.login.and.returnValue(of({ token: 'token-valido-123' }));

      component.onLogin();

      expect(component.isAuthenticated).toBeTrue();
      expect(component.loginError).toBe('');
      expect(component.activeTab).toBe('clientes');
    });

    it('Debe alternar entre Login y Registro con toggleRegister', () => {
      expect(component.showRegister).toBeFalse();

      component.toggleRegister();
      fixture.detectChanges();
      expect(component.showRegister).toBeTrue();
      expect(fixture.debugElement.query(By.css('app-register'))).toBeTruthy();

      component.toggleRegister();
      fixture.detectChanges();
      expect(component.showRegister).toBeFalse();
    });
  });

  describe('Cuando SÍ está autenticado', () => {
    beforeEach(() => {
      authServiceMock.isLoggedIn.and.returnValue(true);
      fixture.detectChanges();
    });

    it('Debe mostrar el dashboard y ocultar login', () => {
      const header = fixture.debugElement.query(By.css('header'));
      expect(header).toBeTruthy();
      expect(component.isAuthenticated).toBeTrue();
    });

    it('Debe cerrar sesión correctamente', () => {
      component.onLogout();

      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(component.isAuthenticated).toBeFalse();
      expect(component.loginData.username).toBe('');
    });

    it('Debe cambiar entre pestañas correctamente', () => {
      expect(component.activeTab).toBe('clientes');

      component.cambiarTab('proveedores');
      fixture.detectChanges();
      expect(component.activeTab).toBe('proveedores');
      expect(fixture.debugElement.query(By.css('app-proveedor-list'))).toBeTruthy();

      component.cambiarTab('productos');
      fixture.detectChanges();
      expect(component.activeTab).toBe('productos');
      expect(fixture.debugElement.query(By.css('app-productos-list'))).toBeTruthy();

      component.cambiarTab('empleados');
      fixture.detectChanges();
      expect(component.activeTab).toBe('empleados');
      expect(fixture.debugElement.query(By.css('app-empleados-list'))).toBeTruthy();
    });

    it('Debe establecer cliente para edición y hacer scroll', () => {
      const mockCliente = { dniClient: '1', nameClient: 'Juan', surnameClient: 'P' };
      component.setEditCliente(mockCliente);
      
      expect(component.clienteEditar).toEqual(mockCliente);
      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('Debe establecer proveedor para edición', () => {
      const mockProv = { nombreFiscal: 'Empresa', rucNitNif: '123', direccionFisica: 'Norte' };
      component.setEditProveedor(mockProv);
      expect(component.proveedorEditar).toEqual(mockProv);
    });

    it('Debe establecer producto para edición', () => {
      const mockProd = { codeProduct: '1', nameProduct: 'A', descriptionProduct: 'B', priceProduct: 1, stockProduct: 1 };
      component.setEditProducto(mockProd);
      expect(component.productoEditar).toEqual(mockProd);
    });

    it('Debe establecer empleado para edición', () => {
      const mockEmp = { cedulaEmpleado: '1', nombreEmpleado: 'A', celularEmpleado: '099', sueldoEmpleado: 100 };
      component.setEditEmpleado(mockEmp);
      expect(component.empleadoEditar).toEqual(mockEmp);
    });

    
    it('Debe recargar lista de CLIENTES al guardar', fakeAsync(() => {
      component.cambiarTab('clientes');
      fixture.detectChanges();
      tick();

      spyOn(component.listaClientes, 'cargarClientes');
      component.onClienteGuardado();

      expect(component.clienteEditar).toBeNull();
      expect(component.listaClientes.cargarClientes).toHaveBeenCalled();
    }));

    it('Debe recargar lista de PROVEEDORES al guardar', fakeAsync(() => {
      component.cambiarTab('proveedores');
      fixture.detectChanges();
      tick();

      spyOn(component.listaProveedores, 'cargar');

      component.onProveedorGuardado();

      expect(component.proveedorEditar).toBeNull();
      expect(component.listaProveedores.cargar).toHaveBeenCalled();
    }));

    it('Debe recargar lista de PRODUCTOS al guardar', fakeAsync(() => {
      component.cambiarTab('productos');
      fixture.detectChanges();
      tick();

      spyOn(component.listaProductos, 'cargar');

      component.onProductoGuardado();

      expect(component.productoEditar).toBeNull();
      expect(component.listaProductos.cargar).toHaveBeenCalled();
    }));

    it('Debe recargar lista de EMPLEADOS al guardar', fakeAsync(() => {
      component.cambiarTab('empleados');
      fixture.detectChanges();
      tick();

      spyOn(component.listaEmpleados, 'cargar');

      component.onEmpleadoGuardado();

      expect(component.empleadoEditar).toBeNull();
      expect(component.listaEmpleados.cargar).toHaveBeenCalled();
    }));

    it('Debe limpiar todos los objetos de edición al llamar cancelarEdicion', () => {
      component.clienteEditar = {} as any;
      component.proveedorEditar = {} as any;
      
      component.cancelarEdicion();

      expect(component.clienteEditar).toBeNull();
      expect(component.proveedorEditar).toBeNull();
      expect(component.productoEditar).toBeNull();
      expect(component.empleadoEditar).toBeNull();
    });
  });
});