import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpleadoFormComponent } from './empleado-form.component';
import { EmpleadoService } from '../../services/empleado.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('EmpleadoFormComponent', () => {
  let component: EmpleadoFormComponent;
  let fixture: ComponentFixture<EmpleadoFormComponent>;
  let mockService: any;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('EmpleadoService', ['crear', 'actualizar']);
    mockService.crear.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [EmpleadoFormComponent, ReactiveFormsModule],
      providers: [{ provide: EmpleadoService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(EmpleadoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debe tener el sueldo base predeterminado en 460', () => {
    expect(component.form.controls['sueldoEmpleado'].value).toBe(460);
  });

  it('Debe validar cédula de 10 dígitos', () => {
    const cedula = component.form.controls['cedulaEmpleado'];
    cedula.setValue('123'); 
    expect(cedula.invalid).toBeTrue();

    cedula.setValue('1712345678'); 
    expect(cedula.valid).toBeTrue();
  });
});