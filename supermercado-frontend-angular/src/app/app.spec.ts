import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './services/auth.service';
import { ClienteService } from './services/cliente.service';
import { ProveedorService } from './services/proveedor.service';
import { ProductoService } from './services/producto.service';
import { EmpleadoService } from './services/empleado.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('App Component (Integration)', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let authServiceMock: any;
  let crudServiceMock: any;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'login', 'logout', 'register']);
    authServiceMock.isLoggedIn.and.returnValue(true);
    authServiceMock.login.and.returnValue(of({}));
    authServiceMock.logout.and.stub();

    crudServiceMock = jasmine.createSpyObj('CrudService', ['obtenerTodos', 'crear', 'actualizar', 'eliminar']);
    crudServiceMock.obtenerTodos.and.returnValue(of([]));
    crudServiceMock.crear.and.returnValue(of({}));
    crudServiceMock.actualizar.and.returnValue(of({}));
    crudServiceMock.eliminar.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [App],
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
    fixture.detectChanges();
  });

  it('Debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('Debe iniciar en la pestaña de clientes por defecto', () => {
    expect(component.activeTab).toBe('clientes');
    const tabClientes = fixture.debugElement.query(By.css('.tab.active'));
    expect(tabClientes.nativeElement.textContent).toContain('Clientes');
  });

  it('Debe renderizar la lista de clientes (Componente Hijo)', () => {
    const listaClientes = fixture.debugElement.query(By.css('app-clientes-list'));
    expect(listaClientes).toBeTruthy();
  });

  it('Debe cambiar de pestaña a Proveedores al hacer click', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.tab'));
    const btnProv = buttons.find(b => b.nativeElement.textContent.includes('Proveedores'));

    btnProv?.nativeElement.click();
    fixture.detectChanges();

    expect(component.activeTab).toBe('proveedores');

    const listaProv = fixture.debugElement.query(By.css('app-proveedor-list'));
    expect(listaProv).toBeTruthy();
  });

  it('Debe cerrar sesión correctamente', () => {
    const btnLogout = fixture.debugElement.query(By.css('header button.btn-secondary'));
    btnLogout.nativeElement.click();
    fixture.detectChanges();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(component.isAuthenticated).toBeFalse();
  
    const loginForm = fixture.debugElement.query(By.css('form'));
    expect(loginForm).toBeTruthy();
  });
});