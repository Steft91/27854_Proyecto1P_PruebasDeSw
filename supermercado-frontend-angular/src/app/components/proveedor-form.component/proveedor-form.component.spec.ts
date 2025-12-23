import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProveedorFormComponent, rucEcuatorianoValidator } from './proveedor-form.component';
import { ProveedorService } from '../../services/proveedor.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ProveedorFormComponent', () => {
  let component: ProveedorFormComponent;
  let fixture: ComponentFixture<ProveedorFormComponent>;
  let mockService: jasmine.SpyObj<ProveedorService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ProveedorService', ['crear', 'actualizar']);
    mockService.crear.and.returnValue(of({}));
    mockService.actualizar.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ProveedorFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ProveedorService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debe inicializar el formulario inválido', () => {
    expect(component.form.valid).toBeFalse();
    expect(component.form.get('nombreFiscal')?.hasError('required')).toBeTrue();
  });

  it('Debe validar que el RUC/NIT acepte solo dígitos (según regex actual)', () => {
    const control = component.form.get('rucNitNif');
    
    // Caso inválido: Letras
    control?.setValue('ABC1234567');
    expect(control?.hasError('pattern')).toBeTrue();

    // Caso válido: 10 a 15 dígitos
    control?.setValue('1720000001001');
    expect(control?.valid).toBeTrue();
  });

  it('Debe validar formato de email', () => {
    const control = component.form.get('correoElectronico');
    control?.setValue('no-es-un-email');
    expect(control?.hasError('email')).toBeTrue();
  });

  it('Debe llenar el formulario y deshabilitar RUC en MODO EDICIÓN', () => {
    const proveedorMock = {
      _id: '555',
      nombreFiscal: 'Supermaxi',
      rucNitNif: '1790012345001',
      direccionFisica: 'Av. 10 de Agosto',
      telefonoPrincipal: '022999999',
      correoElectronico: 'info@supermaxi.com'
    };

    component.proveedorEditar = proveedorMock;

    component.ngOnChanges({
      proveedorEditar: {
        currentValue: proveedorMock,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.form.value).toEqual(jasmine.objectContaining({ nombreFiscal: 'Supermaxi' }));
    expect(component.form.get('rucNitNif')?.disabled).toBeTrue();
  });

  it('Debe resetear el formulario y habilitar RUC si proveedorEditar pasa a NULL', () => {
    component.form.get('rucNitNif')?.disable();

    component.proveedorEditar = null;
    component.ngOnChanges({
      proveedorEditar: {
        currentValue: null,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.form.get('rucNitNif')?.enabled).toBeTrue();
    expect(component.form.pristine).toBeTrue();
  });

  it('Debe llamar a CREAR si no hay ID de proveedor', () => {
    component.proveedorEditar = null;
    component.form.setValue({
      nombreFiscal: 'Nuevo Prov',
      rucNitNif: '1722222222001',
      direccionFisica: 'Calle Nueva',
      telefonoPrincipal: '0991234567',
      correoElectronico: 'nuevo@prov.com',
      contactoNombre: 'Juan',
      contactoPuesto: 'Ventas'
    });

    component.onSubmit();

    expect(mockService.crear).toHaveBeenCalled();
    expect(mockService.actualizar).not.toHaveBeenCalled();
  });

  it('Debe llamar a ACTUALIZAR si existe proveedorEditar con ID', () => {
    const provExistente = { _id: '123', nombreFiscal: 'Viejo' };
    component.proveedorEditar = provExistente as any;

    component.ngOnChanges({ proveedorEditar: { currentValue: provExistente } } as any);
    
    component.form.patchValue({
      nombreFiscal: 'Actualizado',
      rucNitNif: '1722222222001',
      direccionFisica: 'Dir',
      telefonoPrincipal: '1234567',
      correoElectronico: 'a@a.com',
      contactoNombre: '',
      contactoPuesto: ''
    });

    component.onSubmit();

    expect(mockService.actualizar).toHaveBeenCalledWith('123', jasmine.any(Object));
    expect(mockService.crear).not.toHaveBeenCalled();
  });

  it('NO debe enviar si el formulario es inválido', () => {
    component.form.reset();
    component.onSubmit();
    
    expect(mockService.crear).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('Debe manejar error 403 (No autorizado)', () => {
    spyOn(window, 'alert');
    mockService.crear.and.returnValue(throwError(() => ({ status: 403 })));

    component.form.setValue({
      nombreFiscal: 'Prov Error',
      rucNitNif: '1234567890',
      direccionFisica: 'Dir',
      telefonoPrincipal: '1234567',
      correoElectronico: 'e@e.com',
      contactoNombre: '', contactoPuesto: ''
    });

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/403/));
    expect(component.isSubmitting).toBeFalse();
  });

  it('Debe manejar errores genéricos', () => {
    spyOn(window, 'alert');
    mockService.crear.and.returnValue(throwError(() => ({ message: 'Error interno' })));

    component.form.setValue({
      nombreFiscal: 'Prov Error',
      rucNitNif: '1234567890',
      direccionFisica: 'Dir',
      telefonoPrincipal: '1234567',
      correoElectronico: 'e@e.com',
      contactoNombre: '', contactoPuesto: ''
    });

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/Error interno/));
    expect(component.isSubmitting).toBeFalse();
  });

  it('Debe emitir cancelar y resetear al llamar reset()', () => {
    spyOn(component.cancelar, 'emit');
    component.reset();
    expect(component.cancelar.emit).toHaveBeenCalled();
    expect(component.isSubmitting).toBeFalse();
  });

  it('Debe verificar isFieldInvalid correctamente', () => {
    const control = component.form.get('nombreFiscal');
    expect(component.isFieldInvalid('nombreFiscal')).toBeFalse();

    control?.markAsTouched();
    control?.setErrors({ required: true });

    expect(component.isFieldInvalid('nombreFiscal')).toBeTrue();
  });

  describe('rucEcuatorianoValidator (Función)', () => {
    
    it('Debe retornar null si el valor es vacío (dejar pasar opcionales)', () => {
      const control = new FormControl('');
      expect(rucEcuatorianoValidator(control)).toBeNull();
    });

    it('Debe validar que solo contenga números', () => {
      const control = new FormControl('171234567A001'); // Letra A
      expect(rucEcuatorianoValidator(control)).toEqual({ rucInvalido: true });
    });

    it('Debe validar longitud exacta de 13 dígitos', () => {
      const controlCorto = new FormControl('171234567800'); // 12
      expect(rucEcuatorianoValidator(controlCorto)).toEqual({ rucInvalido: true });
    });

    it('Debe validar que termine en 001', () => {
      const controlMalFinal = new FormControl('1710034065002'); // Termina en 002
      expect(rucEcuatorianoValidator(controlMalFinal)).toEqual({ rucInvalido: true });
    });

    it('Debe aceptar un RUC válido (13 dígitos y termina en 001)', () => {
      const controlValido = new FormControl('1710034065001');
      expect(rucEcuatorianoValidator(controlValido)).toBeNull();
    });
  });
});