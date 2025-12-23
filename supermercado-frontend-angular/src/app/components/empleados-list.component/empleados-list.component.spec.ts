import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpleadosListComponent } from './empleados-list.component';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../models';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('EmpleadosListComponent', () => {
  let component: EmpleadosListComponent;
  let fixture: ComponentFixture<EmpleadosListComponent>;
  let mockService: jasmine.SpyObj<EmpleadoService>;

  const DATA: Empleado[] = [
    { 
      cedulaEmpleado: '111', 
      nombreEmpleado: 'Juan', 
      sueldoEmpleado: 500, 
      celularEmpleado: '099', 
      emailEmpleado: 'juan@test.com', 
      direccionEmpleado: 'Quito' 
    }
  ];

  beforeEach(async () => {
    // 1. Mockear el servicio
    mockService = jasmine.createSpyObj('EmpleadoService', ['obtenerTodos', 'eliminar']);
    mockService.obtenerTodos.and.returnValue(of(DATA));
    mockService.eliminar.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [EmpleadosListComponent],
      providers: [
        { provide: EmpleadoService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmpleadosListComponent);
    component = fixture.componentInstance;
  });

  it('Debe cargar y mostrar los empleados correctamente (Happy Path)', () => {
    fixture.detectChanges();
    expect(component.empleados().length).toBe(1);
    expect(component.loading()).toBeFalse();

    const row = fixture.debugElement.query(By.css('tbody tr'));
    expect(row.nativeElement.textContent).toContain('Juan');
    expect(row.nativeElement.textContent).toContain('500');
  });

  it('Debe manejar formato de datos inválido (si backend no devuelve array)', () => {
    mockService.obtenerTodos.and.returnValue(of({ error: 'formato invalido' } as any));
    spyOn(console, 'error');

    fixture.detectChanges();

    expect(component.empleados().length).toBe(0);
    expect(console.error).toHaveBeenCalledWith('El formato recibido no es un array:', jasmine.any(Object));
  });

  it('Debe manejar error de red al cargar empleados', () => {
    const errorMsg = { message: 'Network Error' };
    mockService.obtenerTodos.and.returnValue(throwError(() => errorMsg));
    spyOn(console, 'error');

    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
    expect(component.empleados().length).toBe(0);
    expect(console.error).toHaveBeenCalledWith('Error al cargar empleados:', errorMsg);
  });

  it('Debe mostrar mensaje vacío si no hay registros', () => {
    mockService.obtenerTodos.and.returnValue(of([]));
    fixture.detectChanges();
    
    const emptyMsg = fixture.debugElement.query(By.css('.empty-message'));
    expect(emptyMsg).toBeTruthy();
    expect(emptyMsg.nativeElement.textContent).toContain('No tiene acceso a este contenido');
  });

  it('Debe emitir el evento EDITAR al hacer clic en el botón de edición', () => {
    fixture.detectChanges();
    spyOn(component.editar, 'emit');

    const editBtn = fixture.debugElement.query(By.css('.btn-edit'));
    editBtn.triggerEventHandler('click', null);

    expect(component.editar.emit).toHaveBeenCalledWith(DATA[0]);
  });

  it('Debe preparar la eliminación abriendo el modal (onEliminar)', () => {
    fixture.detectChanges();
    
    component.onEliminar('111', 'Juan');

    expect(component.showDeleteModal).toBeTrue();
    expect(component.empleadoToDelete).toEqual({ cedula: '111', nombre: 'Juan' });
  });

  it('Debe llamar al servicio eliminar, recargar y cerrar modal al confirmar', () => {
    fixture.detectChanges();
    spyOn(window, 'alert');

    component.empleadoToDelete = { cedula: '111', nombre: 'Juan' };
    component.showDeleteModal = true;

    component.confirmDelete();

    expect(mockService.eliminar).toHaveBeenCalledWith('111');
    expect(window.alert).toHaveBeenCalledWith('Empleado desvinculado correctamente');
    expect(component.showDeleteModal).toBeFalse();
    expect(component.empleadoToDelete).toBeNull();
    expect(mockService.obtenerTodos).toHaveBeenCalledTimes(2);
  });

  it('Debe manejar el error al intentar eliminar', () => {
    fixture.detectChanges();
    spyOn(window, 'alert');
    
    const errorRes = { error: { message: 'No se puede borrar por integridad referencial' } };
    mockService.eliminar.and.returnValue(throwError(() => errorRes));

    component.empleadoToDelete = { cedula: '111', nombre: 'Juan' };
    
    component.confirmDelete();

    expect(mockService.eliminar).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Error al eliminar: No se puede borrar por integridad referencial');
    expect(component.showDeleteModal).toBeFalse();
  });

  it('No debe llamar a eliminar si no hay empleado seleccionado (Guard Clause)', () => {
    fixture.detectChanges();
    component.empleadoToDelete = null;
    
    component.confirmDelete();

    expect(mockService.eliminar).not.toHaveBeenCalled();
  });

  it('Debe resetear el estado al llamar closeModal', () => {
    component.showDeleteModal = true;
    component.empleadoToDelete = { cedula: '1', nombre: 'x' };
    
    component.closeModal();

    expect(component.showDeleteModal).toBeFalse();
    expect(component.empleadoToDelete).toBeNull();
  });
});