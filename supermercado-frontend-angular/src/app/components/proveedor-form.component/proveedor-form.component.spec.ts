import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProveedorFormComponent } from './proveedor-form.component';
import { ProveedorService } from '../../services/proveedor.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ProveedorFormComponent', () => {
  let component: ProveedorFormComponent;
  let fixture: ComponentFixture<ProveedorFormComponent>;
  let mockService: any;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ProveedorService', ['crear', 'actualizar']);
    mockService.crear.and.returnValue(of({}));
    mockService.actualizar.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ProveedorFormComponent, ReactiveFormsModule],
      providers: [{ provide: ProveedorService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debe ser inválido si el RUC tiene formato incorrecto', () => {
    const rucControl = component.form.controls['rucNitNif'];
    
    // Caso inválido (letras)
    rucControl.setValue('ABC12345'); 
    expect(rucControl.invalid).toBeTrue();

    // Caso válido (13 dígitos numéricos)
    rucControl.setValue('1720000001001');
    expect(rucControl.valid).toBeTrue();
  });

  it('Debe enviar el formulario (Crear) si es válido', () => {
    component.form.setValue({
      nombreFiscal: 'Distribuidora XYZ',
      rucNitNif: '1790012345001',
      direccionFisica: 'Av. Amazonas',
      telefonoPrincipal: '022345678',
      correoElectronico: 'ventas@xyz.com',
      contactoNombre: 'Maria',
      contactoPuesto: 'Gerente'
    });
    
    component.onSubmit();

    expect(mockService.crear).toHaveBeenCalled();
  });

  it('Debe llamar a Actualizar si existe proveedorEditar', () => {
    component.proveedorEditar = { _id: '555', nombreFiscal: 'Test', rucNitNif: '1234567890', direccionFisica: 'Dir' };
    component.ngOnChanges({
      proveedorEditar: { currentValue: component.proveedorEditar, previousValue: null, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();
    component.form.patchValue({ nombreFiscal: 'Test Editado' });
    
    component.onSubmit();

    expect(mockService.actualizar).toHaveBeenCalledWith('555', jasmine.any(Object));
  });

  describe('Validación de RUC (Regresión)', () => {
    it('Debe rechazar un RUC que no termine en 001', () => {
      const control = component.form.controls['rucNitNif'];
      // INTENTO FALLIDO (Antes pasaba, ahora debe fallar)
      control.setValue('1710034065002'); 
      expect(control.hasError('rucInvalido')).toBeTrue();
    });

    it('Debe aceptar un RUC válido de 13 dígitos terminado en 001', () => {
      const control = component.form.controls['rucNitNif'];
      // INTENTO EXITOSO
      control.setValue('1710034065001');
      expect(control.valid).toBeTrue();
    });
  });
});