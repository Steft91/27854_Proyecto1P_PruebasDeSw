import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteFormComponent, cedulaEcuatorianaValidator } from './cliente-form.component';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ClienteFormComponent', () => {
  let component: ClienteFormComponent;
  let fixture: ComponentFixture<ClienteFormComponent>;
  let clienteServiceMock: jasmine.SpyObj<ClienteService>;

  beforeEach(async () => {
    clienteServiceMock = jasmine.createSpyObj('ClienteService', ['crear', 'actualizar']);

    const clienteMockResponse: Cliente = {
      dniClient: '1720000001',
      nameClient: 'Mock',
      surnameClient: 'User',
      addressClient: 'Dir',
      emailClient: 'm@m.com',
      phoneClient: '0999999999'
    };
    clienteServiceMock.crear.and.returnValue(of(clienteMockResponse));

    clienteServiceMock.actualizar.and.returnValue(of(undefined));

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

  it('Debe inicializar el formulario inválido (campos requeridos vacíos)', () => {
    expect(component.form.valid).toBeFalse();
    expect(component.form.controls['dniClient'].errors?.['required']).toBeTrue();
  });

  it('Debe actualizar el formulario desde la vista (HTML -> Modelo)', () => {
    const inputNombre = fixture.debugElement.query(By.css('input[formControlName="nameClient"]')).nativeElement;
    inputNombre.value = 'Juan Perez';
    inputNombre.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.form.controls['nameClient'].value).toEqual('Juan Perez');
  });

  it('Debe llenar el formulario y deshabilitar DNI si llega un cliente para editar', () => {
    const clienteMock: Cliente = {
      dniClient: '1720000001', nameClient: 'Juan', surnameClient: 'Perez',
      addressClient: 'Quito', emailClient: 'j@j.com', phoneClient: '0999999999'
    };

    component.clienteEditar = clienteMock;

    component.ngOnChanges({
      clienteEditar: {
        currentValue: clienteMock,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.form.value).toEqual(jasmine.objectContaining({ nameClient: 'Juan' }));
    expect(component.form.get('dniClient')?.disabled).toBeTrue();
  });

  it('Debe resetear el formulario y habilitar DNI si clienteEditar cambia a null', () => {
    component.form.get('dniClient')?.disable();

    component.clienteEditar = null;
    component.ngOnChanges({
      clienteEditar: {
        currentValue: null,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.form.get('dniClient')?.enabled).toBeTrue();
    expect(component.form.pristine).toBeTrue();
  });

  it('Debe llamar a CREAR cuando no hay clienteEditar y el form es válido', () => {
    component.clienteEditar = null;
    component.form.setValue({
      dniClient: '1720000001', nameClient: 'Carlos', surnameClient: 'Vives',
      addressClient: 'Calle Falsa', emailClient: 'c@test.com', phoneClient: '0991234567'
    });

    component.onSubmit();

    expect(clienteServiceMock.crear).toHaveBeenCalled();
    expect(clienteServiceMock.actualizar).not.toHaveBeenCalled();
  });

  it('Debe llamar a ACTUALIZAR cuando existe clienteEditar', () => {
    const clienteMock: Cliente = { 
        dniClient: '1720000001', nameClient: 'Juan', surnameClient: 'Perez', addressClient: 'Q' 
    };
    component.clienteEditar = clienteMock;

    component.ngOnChanges({ clienteEditar: { currentValue: clienteMock } } as any);

    component.form.patchValue({
      dniClient: '1720000001', nameClient: 'Editado', surnameClient: 'Vives',
      addressClient: 'Calle', emailClient: 'c@test.com', phoneClient: '0991234567'
    });

    component.onSubmit();

    expect(clienteServiceMock.actualizar).toHaveBeenCalled();
    expect(clienteServiceMock.crear).not.toHaveBeenCalled();
  });

  it('NO debe enviar si el formulario es inválido', () => {
    component.form.reset();
    component.onSubmit();
    
    expect(clienteServiceMock.crear).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('Debe emitir evento cancelar y resetear al llamar a reset()', () => {
    spyOn(component.cancelar, 'emit');
    component.reset();
    
    expect(component.cancelar.emit).toHaveBeenCalled();
    expect(component.form.pristine).toBeTrue();
  });

  it('Debe manejar error 403 (No autorizado)', () => {
    spyOn(window, 'alert');
    const error403 = { status: 403 };
    clienteServiceMock.crear.and.returnValue(throwError(() => error403));

    component.form.setValue({
      dniClient: '1720000001', nameClient: 'A', surnameClient: 'B',
      addressClient: 'C', emailClient: 'a@a.com', phoneClient: '0991234567'
    });

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/403/));
    expect(component.isSubmitting).toBeFalse();
  });

  it('Debe manejar errores genéricos del servidor', () => {
    spyOn(window, 'alert');
    const errorGen = { message: 'Error interno', error: { message: 'Mensaje detallado' } };
    clienteServiceMock.crear.and.returnValue(throwError(() => errorGen));

    component.form.setValue({
      dniClient: '1720000001', nameClient: 'A', surnameClient: 'B',
      addressClient: 'C', emailClient: 'a@a.com', phoneClient: '0991234567'
    });

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/Mensaje detallado/));
    expect(component.isSubmitting).toBeFalse();
  });

  describe('Función cedulaEcuatorianaValidator', () => {
    
    it('Debe retornar null si el valor está vacío (para permitir opcionales o required aparte)', () => {
      const control = new FormControl('');
      expect(cedulaEcuatorianaValidator(control)).toBeNull();
    });

    it('Debe validar longitud y números', () => {
      // Menos de 10
      expect(cedulaEcuatorianaValidator(new FormControl('123'))).toEqual({ cedulaInvalida: true });
      // Letras
      expect(cedulaEcuatorianaValidator(new FormControl('abcdefghij'))).toEqual({ cedulaInvalida: true });
    });

    it('Debe validar código de provincia (01-24)', () => {
      // Provincia 99 no existe
      expect(cedulaEcuatorianaValidator(new FormControl('9912345678'))).toEqual({ cedulaInvalida: true });
    });

    it('Debe validar tercer dígito (< 6 para personas naturales)', () => {
      // Tercer dígito 9 (RUC jurídico o público, inválido para cédula personal en este validador)
      expect(cedulaEcuatorianaValidator(new FormControl('1790011111'))).toEqual({ cedulaInvalida: true });
    });

    it('Debe validar algoritmo módulo 10 (dígito verificador)', () => {
      // Cédula matemáticamente incorrecta (último dígito cambiado)
      expect(cedulaEcuatorianaValidator(new FormControl('1710034068'))).toEqual({ cedulaInvalida: true });
    });

    it('Debe aceptar una cédula válida', () => {
      expect(cedulaEcuatorianaValidator(new FormControl('1710034065'))).toBeNull();
    });
  });
});