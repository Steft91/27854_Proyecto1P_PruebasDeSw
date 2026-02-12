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
    // Arrange: component already initialized in beforeEach

    // Act: no action needed, testing initial state

    // Assert
    expect(component.form.controls['sueldoEmpleado'].value).toBe(460);
  });

  it('Debe ser inválido si faltan campos requeridos', () => {
    // Arrange: form is already initialized

    // Act
    component.form.controls['cedulaEmpleado'].setValue('');
    component.form.controls['nombreEmpleado'].setValue('');

    // Assert
    expect(component.form.invalid).toBeTrue();
  });

  it('Debe validar formato de celular (empezar con 09 y tener 10 dígitos)', () => {
    // Arrange
    const celular = component.form.controls['celularEmpleado'];
    
    // Act & Assert: test invalid format
    celular.setValue('0812345678');
    expect(celular.hasError('pattern')).toBeTrue();

    // Act & Assert: test valid format
    celular.setValue('0912345678');
    expect(celular.valid).toBeTrue();
  });

  describe('Función sueldoMinimoValidator', () => {
    it('Debe retornar null si el sueldo es válido (>= 460)', () => {
      // Arrange
      const control = new FormControl(460);

      // Act
      const result = sueldoMinimoValidator(control);

      // Assert
      expect(result).toBeNull();
    });

    it('Debe retornar error sueldoIlegal si es menor a 460', () => {
      // Arrange
      const control = new FormControl(459);

      // Act
      const result = sueldoMinimoValidator(control);

      // Assert
      expect(result).toEqual({ sueldoIlegal: true });
    });

    it('Debe retornar null si no hay valor (para dejar pasar Validators.required)', () => {
      // Arrange
      const control = new FormControl(null);

      // Act
      const result = sueldoMinimoValidator(control);

      // Assert
      expect(result).toBeNull();
    });
  });

  it('Debe llenar el formulario y deshabilitar la cédula en MODO EDICIÓN (ngOnChanges)', () => {
    // Arrange
    const empleadoMock = {
      cedulaEmpleado: '1712345678',
      nombreEmpleado: 'Juan',
      sueldoEmpleado: 500,
      celularEmpleado: '0912345678',
      emailEmpleado: 'test@test.com',
      direccionEmpleado: 'Quito'
    };
    component.empleadoEditar = empleadoMock;

    // Act
    component.ngOnChanges({
      empleadoEditar: {
        currentValue: empleadoMock,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    // Assert
    expect(component.form.value).toEqual(jasmine.objectContaining({ nombreEmpleado: 'Juan' }));
    expect(component.form.controls['cedulaEmpleado'].disabled).toBeTrue();
  });

  it('Debe llamar a ACTUALIZAR si existe empleadoEditar', () => {
    // Arrange
    component.empleadoEditar = { cedulaEmpleado: '1712345678' } as any;
    component.ngOnChanges({} as any);
    component.form.patchValue({
      cedulaEmpleado: '1712345678',
      nombreEmpleado: 'Editado',
      celularEmpleado: '0912345678',
      sueldoEmpleado: 500,
      emailEmpleado: 'a@a.com'
    });

    // Act
    component.onSubmit();

    // Assert
    expect(mockService.actualizar).toHaveBeenCalled();
    expect(mockService.crear).not.toHaveBeenCalled();
  });

  it('Debe llamar a CREAR si NO existe empleadoEditar', () => {
    // Arrange
    component.empleadoEditar = null;
    component.form.patchValue({
      cedulaEmpleado: '1712345678',
      nombreEmpleado: 'Nuevo',
      celularEmpleado: '0912345678',
      sueldoEmpleado: 460,
      emailEmpleado: 'nuevo@test.com'
    });

    // Act
    component.onSubmit();

    // Assert
    expect(mockService.crear).toHaveBeenCalled();
    expect(mockService.actualizar).not.toHaveBeenCalled();
  });

  it('NO debe llamar al servicio si el formulario es inválido', () => {
    // Arrange
    component.form.reset();

    // Act
    component.onSubmit();
    
    // Assert
    expect(mockService.crear).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('Debe manejar error 403 (No autorizado)', () => {
    // Arrange
    mockService.crear.and.returnValue(throwError(() => ({ status: 403 })));
    spyOn(window, 'alert');
    component.form.patchValue({
      cedulaEmpleado: '1712345678',
      nombreEmpleado: 'Test Error',
      celularEmpleado: '0912345678',
      sueldoEmpleado: 460,
      emailEmpleado: 'e@e.com'
    });

    // Act
    component.onSubmit();

    // Assert
    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/403/)); // Verifica mensaje específico
    expect(component.isSubmitting).toBeFalse();
  });

  it('Debe manejar errores genéricos del servidor', () => {
    // Arrange
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

    // Act
    component.onSubmit();

    // Assert
    expect(window.alert).toHaveBeenCalledWith('Error: ' + errorMsg);
    expect(component.isSubmitting).toBeFalse();
  });

  it('should verify isFieldInvalid logic', () => {
    // Arrange
    const control = component.form.controls['nombreEmpleado'];

    // Act & Assert: initially valid
    expect(component.isFieldInvalid('nombreEmpleado')).toBeFalse();

    // Act: make it invalid
    control.markAsTouched();
    control.setErrors({ required: true });

    // Assert
    expect(component.isFieldInvalid('nombreEmpleado')).toBeTrue();
  });

  it('should verify hasError logic', () => {
    // Arrange
    const control = component.form.controls['emailEmpleado'];

    // Act
    control.setValue('email-invalido');
    control.markAsTouched();

    // Assert
    expect(component.hasError('emailEmpleado', 'email')).toBeTrue();
  });

  it('Debe emitir evento cancelar al resetear', () => {
    // Arrange
    spyOn(component.cancelar, 'emit');

    // Act
    component.reset();

    // Assert
    expect(component.cancelar.emit).toHaveBeenCalled();
    expect(component.form.pristine).toBeTrue();
  });
});