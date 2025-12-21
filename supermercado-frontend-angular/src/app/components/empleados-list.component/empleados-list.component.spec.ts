import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpleadosListComponent } from './empleados-list.component';
import { EmpleadoService } from '../../services/empleado.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('EmpleadosListComponent', () => {
  let component: EmpleadosListComponent;
  let fixture: ComponentFixture<EmpleadosListComponent>;
  let mockService: any;

  const DATA = [
    { cedulaEmpleado: '111', nombreEmpleado: 'Juan', sueldoEmpleado: 500, celularEmpleado: '099' }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('EmpleadoService', ['obtenerTodos', 'eliminar']);
    mockService.obtenerTodos.and.returnValue(of(DATA));
    mockService.eliminar.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [EmpleadosListComponent],
      providers: [{ provide: EmpleadoService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(EmpleadosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debe cargar y mostrar los empleados', () => {
    expect(component.empleados().length).toBe(1);
    const row = fixture.debugElement.query(By.css('tbody tr'));
    expect(row.nativeElement.textContent).toContain('Juan');
    expect(row.nativeElement.textContent).toContain('500');
  });
});