import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteFormComponent } from './cliente-form.component';
import { ClienteService } from '../../services/cliente.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ClienteFormComponent', () => {
  let component: ClienteFormComponent;
  let fixture: ComponentFixture<ClienteFormComponent>;
  let clienteServiceMock: any;

  beforeEach(async () => {
    clienteServiceMock = jasmine.createSpyObj('ClienteService', ['crear', 'actualizar']);
    clienteServiceMock.crear.and.returnValue(of({}));
    clienteServiceMock.actualizar.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ClienteFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ClienteService, useValue: clienteServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('Debe ser inválido si los campos están vacíos', () => {
    const form = component.form;
    expect(form.valid).toBeFalse();

    const dniControl = form.controls['dniClient'];
    expect(dniControl.valid).toBeFalse();
    expect(dniControl.errors?.['required']).toBeTrue();
  });

it('Debe actualizar el valor del formulario cuando se escribe en el input HTML', () => {
    const inputNombre = fixture.debugElement.query(By.css('input[formControlName="nameClient"]')).nativeElement;

    inputNombre.value = 'Juan Perez';
    inputNombre.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.form.controls['nameClient'].value).toEqual('Juan Perez');
  });

  it('Debe llamar al servicio.crear cuando se hace submit con datos válidos', () => {
    component.form.setValue({
      //dniClient: '1752854438',
      dniClient: '1720000001',
      nameClient: 'Carlos',
      surnameClient: 'Vives',
      addressClient: 'Calle Falsa 123',
      emailClient: 'carlos@test.com',
      phoneClient: '0991234567'
    });
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', null);
    fixture.detectChanges();

    expect(clienteServiceMock.crear).toHaveBeenCalled();
  });

  it('Debe deshabilitar el campo DNI si está en modo edición', () => {
    component.clienteEditar = {
      dniClient: '999', nameClient: 'A', surnameClient: 'B', addressClient: 'C', emailClient: 'a@a.com', phoneClient: '123'
    };

    component.ngOnChanges({
      clienteEditar: {
        currentValue: component.clienteEditar,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });
    fixture.detectChanges();

    const dniInput = component.form.controls['dniClient'];
    expect(dniInput.disabled).toBeTrue();
  });

  describe('Validación de Cédula (Regresión)', () => {
    
    it('Debe rechazar una cédula que parece real (10 dígitos) pero es matemáticamente falsa', () => {
      const control = component.form.controls['dniClient'];
      
      // CASO DE REGRESIÓN:
      // Esta cédula tiene 10 dígitos y solo números.
      // ANTES: Pasaba (porque solo validábamos 'required' o regex simple).
      // AHORA: Debe fallar porque el último dígito no cumple el Módulo 10.
      control.setValue('1710034068'); // (El dígito verificador real debería ser 5)

      expect(control.hasError('cedulaInvalida')).toBeTrue();
      expect(control.invalid).toBeTrue();
    });

    it('Debe aceptar una cédula ecuatoriana matemáticamente correcta', () => {
      const control = component.form.controls['dniClient'];
      
      // Cédula Válida Real
      control.setValue('1710034065');
      
      expect(control.valid).toBeTrue();
      expect(control.hasError('cedulaInvalida')).toBeFalse();
    });

    it('Debe rechazar cédulas de provincias inexistentes (ej. 99)', () => {
      const control = component.form.controls['dniClient'];
      
      // Empieza con 99 (Ecuador solo tiene hasta la 24 + 30)
      control.setValue('9912345678'); 
      
      expect(control.hasError('cedulaInvalida')).toBeTrue();
    });
  });
});