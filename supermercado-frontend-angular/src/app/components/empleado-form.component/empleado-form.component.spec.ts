import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpleadoFormComponent, sueldoMinimoValidator } from './empleado-form.component';
import { EmpleadoService } from '../../services/empleado.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('EmpleadoFormComponent', () => {
  let component: EmpleadoFormComponent;
  let fixture: ComponentFixture<EmpleadoFormComponent>;
  let mockService: jasmine.SpyObj<EmpleadoService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('EmpleadoService', ['crear', 'actualizar']);
    mockService.crear.and.returnValue(of({}));
    mockService.actualizar.and.returnValue(of({}));

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

  it('Debe ser inválido si faltan campos requeridos', () => {
    component.form.controls['cedulaEmpleado'].setValue('');
    component.form.controls['nombreEmpleado'].setValue('');
    expect(component.form.invalid).toBeTrue();
  });

  it('Debe validar formato de celular (empezar con 09 y tener 10 dígitos)', () => {
    const celular = component.form.controls['celularEmpleado'];
    
    celular.setValue('0812345678');
    expect(celular.hasError('pattern')).toBeTrue();

    celular.setValue('0912345678');
    expect(celular.valid).toBeTrue();
  });

  describe('Función sueldoMinimoValidator', () => {
    it('Debe retornar null si el sueldo es válido (>= 460)', () => {
      const control = new FormControl(460);
      expect(sueldoMinimoValidator(control)).toBeNull();
    });

    it('Debe retornar error sueldoIlegal si es menor a 460', () => {
      const control = new FormControl(459);
      expect(sueldoMinimoValidator(control)).toEqual({ sueldoIlegal: true });
    });

    it('Debe retornar null si no hay valor (para dejar pasar Validators.required)', () => {
      const control = new FormControl(null);
      expect(sueldoMinimoValidator(control)).toBeNull();
    });
  });

  it('Debe llenar el formulario y deshabilitar la cédula en MODO EDICIÓN (ngOnChanges)', () => {
    const empleadoMock = {
      cedulaEmpleado: '1712345678',
      nombreEmpleado: 'Juan',
      sueldoEmpleado: 500,
      celularEmpleado: '0912345678',
      emailEmpleado: 'test@test.com',
      direccionEmpleado: 'Quito'
    };

    component.empleadoEditar = empleadoMock;

    component.ngOnChanges({
      empleadoEditar: {
        currentValue: empleadoMock,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.form.value).toEqual(jasmine.objectContaining({ nombreEmpleado: 'Juan' }));
    expect(component.form.controls['cedulaEmpleado'].disabled).toBeTrue();
  });

  it('Debe llamar a ACTUALIZAR si existe empleadoEditar', () => {
    component.empleadoEditar = { cedulaEmpleado: '1712345678' } as any;
    component.ngOnChanges({} as any);

    component.form.patchValue({
      cedulaEmpleado: '1712345678',
      nombreEmpleado: 'Editado',
      celularEmpleado: '0912345678',
      sueldoEmpleado: 500,
      emailEmpleado: 'a@a.com'
    });

    component.onSubmit();

    expect(mockService.actualizar).toHaveBeenCalled();
    expect(mockService.crear).not.toHaveBeenCalled();
  });

  it('Debe llamar a CREAR si NO existe empleadoEditar', () => {
    component.empleadoEditar = null;
    
    component.form.patchValue({
      cedulaEmpleado: '1712345678',
      nombreEmpleado: 'Nuevo',
      celularEmpleado: '0912345678',
      sueldoEmpleado: 460,
      emailEmpleado: 'nuevo@test.com'
    });

    component.onSubmit();

    expect(mockService.crear).toHaveBeenCalled();
    expect(mockService.actualizar).not.toHaveBeenCalled();
  });

  it('NO debe llamar al servicio si el formulario es inválido', () => {
    component.form.reset();
    component.onSubmit();
    
    expect(mockService.crear).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('Debe manejar error 403 (No autorizado)', () => {
    mockService.crear.and.returnValue(throwError(() => ({ status: 403 })));
    spyOn(window, 'alert');

    component.form.patchValue({
      cedulaEmpleado: '1712345678',
      nombreEmpleado: 'Test Error',
      celularEmpleado: '0912345678',
      sueldoEmpleado: 460,
      emailEmpleado: 'e@e.com'
    });

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/403/)); // Verifica mensaje específico
    expect(component.isSubmitting).toBeFalse();
  });

  it('Debe manejar errores genéricos del servidor', () => {
    const errorMsg = 'Error interno';
    mockService.crear.and.returnValue(throwError(() => ({ error: { message: errorMsg } })));
    spyOn(window, 'alert');

    component.form.patchValue({
      cedulaEmpleado: '1712345678',
      nombreEmpleado: 'Test Error',
      celularEmpleado: '0912345678',
      sueldoEmpleado: 460,
      emailEmpleado: 'e@e.com'
    });

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Error: ' + errorMsg);
    expect(component.isSubmitting).toBeFalse();
  });

  it('should verify isFieldInvalid logic', () => {
    const control = component.form.controls['nombreEmpleado'];
    expect(component.isFieldInvalid('nombreEmpleado')).toBeFalse();

    control.markAsTouched();
    control.setErrors({ required: true });

    expect(component.isFieldInvalid('nombreEmpleado')).toBeTrue();
  });

  it('should verify hasError logic', () => {
    const control = component.form.controls['emailEmpleado'];
    control.setValue('email-invalido');
    control.markAsTouched();

    expect(component.hasError('emailEmpleado', 'email')).toBeTrue();
  });

  it('Debe emitir evento cancelar al resetear', () => {
    spyOn(component.cancelar, 'emit');
    component.reset();
    expect(component.cancelar.emit).toHaveBeenCalled();
    expect(component.form.pristine).toBeTrue();
  });
});