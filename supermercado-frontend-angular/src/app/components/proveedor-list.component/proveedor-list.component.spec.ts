import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProveedorListComponent } from './proveedor-list.component';
import { ProveedorService } from '../../services/proveedor.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ProveedorListComponent', () => {
  let component: ProveedorListComponent;
  let fixture: ComponentFixture<ProveedorListComponent>;
  let mockService: jasmine.SpyObj<ProveedorService>;

  const DATA_TEST = [
    { 
      _id: '1', 
      nombreFiscal: 'Empresa A', 
      rucNitNif: '1234567890', 
      direccionFisica: 'Norte',
      contactoNombre: 'Juan',
      contactoPuesto: 'Gerente',
      telefonoPrincipal: '099',
      correoElectronico: 'a@a.com'
    },
    { 
      _id: '2', 
      nombreFiscal: 'Empresa B', 
      rucNitNif: '0987654321', 
      direccionFisica: 'Sur' 
    }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ProveedorService', ['obtenerTodos', 'eliminar']);
    mockService.obtenerTodos.and.returnValue(of(DATA_TEST));
    mockService.eliminar.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ProveedorListComponent],
      providers: [
        { provide: ProveedorService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedorListComponent);
    component = fixture.componentInstance;
  });

  it('Debe renderizar los proveedores en la tabla (Happy Path)', () => {
    fixture.detectChanges();

    expect(component.proveedores().length).toBe(2);
    expect(component.loading()).toBeFalse();
    
    const filas = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(filas.length).toBe(2);
    expect(filas[0].nativeElement.textContent).toContain('Empresa A');

    expect(filas[0].nativeElement.textContent).toContain('Gerente');
  });

  it('Debe mostrar mensaje vacío si no hay registros', () => {
    mockService.obtenerTodos.and.returnValue(of([]));
    fixture.detectChanges();

    const emptyMsg = fixture.debugElement.query(By.css('.empty-message'));
    expect(emptyMsg).toBeTruthy();
    expect(emptyMsg.nativeElement.textContent).toContain('No tiene acceso');
  });

  it('Debe manejar formato inválido del backend (No es array)', () => {
    mockService.obtenerTodos.and.returnValue(of({ error: 'Objeto raro' } as any));
    spyOn(console, 'error');

    fixture.detectChanges();

    expect(component.proveedores().length).toBe(0);
    expect(console.error).toHaveBeenCalledWith('El formato recibido no es un array:', jasmine.any(Object));
  });

  it('Debe manejar error de red al cargar', () => {
    const errorMsg = { message: 'Network Error' };
    mockService.obtenerTodos.and.returnValue(throwError(() => errorMsg));
    spyOn(console, 'error');

    fixture.detectChanges();

    expect(component.proveedores().length).toBe(0);
    expect(component.loading()).toBeFalse();
    expect(console.error).toHaveBeenCalledWith('Error al cargar proveedores:', errorMsg);
  });

  it('Debe emitir el evento EDITAR al hacer click en el botón', () => {
    fixture.detectChanges();
    spyOn(component.editar, 'emit');

    const btnEdit = fixture.debugElement.query(By.css('.btn-edit'));
    btnEdit.triggerEventHandler('click', null);

    expect(component.editar.emit).toHaveBeenCalledWith(DATA_TEST[0]);
  });

  it('Debe abrir el modal al hacer click en Eliminar', () => {
    fixture.detectChanges();
    component.onEliminar('1', 'Empresa A');

    expect(component.showDeleteModal).toBeTrue();
    expect(component.proveedorToDelete).toEqual({ id: '1', nombre: 'Empresa A' });
  });

  it('NO debe abrir el modal si el ID es indefinido (Guard Clause)', () => {
    fixture.detectChanges();
    component.onEliminar(undefined, 'Nombre');

    expect(component.showDeleteModal).toBeFalse();
    expect(component.proveedorToDelete).toBeNull();
  });

  it('Debe eliminar, recargar y cerrar modal al CONFIRMAR', () => {
    fixture.detectChanges();
    spyOn(window, 'alert');

    component.proveedorToDelete = { id: '1', nombre: 'Empresa A' };
    component.showDeleteModal = true;

    component.confirmDelete();

    expect(mockService.eliminar).toHaveBeenCalledWith('1');
    expect(window.alert).toHaveBeenCalledWith('Proveedor eliminado');
    expect(component.showDeleteModal).toBeFalse();
    expect(component.proveedorToDelete).toBeNull();
    expect(mockService.obtenerTodos).toHaveBeenCalledTimes(2);
  });

  it('Debe manejar error al eliminar y cerrar modal', () => {
    fixture.detectChanges();
    spyOn(window, 'alert');
    mockService.eliminar.and.returnValue(throwError(() => ({ message: 'Error FK' })));

    component.proveedorToDelete = { id: '1', nombre: 'A' };
    component.confirmDelete();

    expect(mockService.eliminar).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Error: Error FK');
    expect(component.showDeleteModal).toBeFalse();
  });

  it('NO debe llamar a eliminar si no hay proveedor seleccionado', () => {
    fixture.detectChanges();
    component.proveedorToDelete = null;
    component.confirmDelete();
    expect(mockService.eliminar).not.toHaveBeenCalled();
  });

  it('Debe resetear el estado al cerrar modal', () => {
    component.showDeleteModal = true;
    component.proveedorToDelete = { id: '1', nombre: 'A' };

    component.closeModal();

    expect(component.showDeleteModal).toBeFalse();
    expect(component.proveedorToDelete).toBeNull();
  });
});