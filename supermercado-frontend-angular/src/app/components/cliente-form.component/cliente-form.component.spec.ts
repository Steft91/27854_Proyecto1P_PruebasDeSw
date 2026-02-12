import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteFormComponent } from './cliente-form.component';
import { ClienteService } from '../../services/cliente.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { Cliente } from '../../models';

describe('ClienteFormComponent', () => {
  let component: ClienteFormComponent;
  let fixture: ComponentFixture<ClienteFormComponent>;
  let clienteService: jasmine.SpyObj<ClienteService>;

  const mockCliente: Cliente = {
    dniClient: '1234567890',
    nameClient: 'Juan',
    surnameClient: 'Pérez',
    emailClient: 'juan@test.com',
    phoneClient: '0987654321',
    addressClient: 'Calle 123'
  };

  beforeEach(async () => {
    const clienteServiceSpy = jasmine.createSpyObj('ClienteService', ['crear', 'actualizar']);

    await TestBed.configureTestingModule({
      imports: [ClienteFormComponent],
      providers: [
        { provide: ClienteService, useValue: clienteServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteFormComponent);
    component = fixture.componentInstance;
    clienteService = TestBed.inject(ClienteService) as jasmine.SpyObj<ClienteService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.get('dniClient')?.value).toBe('');
    expect(component.form.get('nameClient')?.value).toBe('');
    expect(component.form.get('surnameClient')?.value).toBe('');
  });

  it('should populate form when clienteEditar is set', () => {
    component.clienteEditar = mockCliente;
    component.ngOnChanges({});

    expect(component.form.get('dniClient')?.value).toBe(mockCliente.dniClient);
    expect(component.form.get('nameClient')?.value).toBe(mockCliente.nameClient);
    expect(component.form.get('dniClient')?.disabled).toBeTrue();
  });

  it('should mark form as invalid when required fields are empty', () => {
    expect(component.form.valid).toBeFalse();

    component.form.patchValue({
      dniClient: '1234567890',
      nameClient: 'Juan',
      surnameClient: 'Pérez',
      addressClient: 'Calle 123'
    });

    expect(component.form.valid).toBeTrue();
  });

  it('should call crear when submitting new cliente', () => {
    spyOn(window, 'alert');
    clienteService.crear.and.returnValue(of(mockCliente));

    component.form.patchValue({
      dniClient: '1234567890',
      nameClient: 'Juan',
      surnameClient: 'Pérez',
      addressClient: 'Calle 123'
    });

    component.onSubmit();

    expect(clienteService.crear).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Cliente creado');
  });

  it('should call actualizar when submitting existing cliente', () => {
    spyOn(window, 'alert');
    component.clienteEditar = mockCliente;
    component.ngOnChanges({});

    clienteService.actualizar.and.returnValue(of(undefined));

    component.onSubmit();

    expect(clienteService.actualizar).toHaveBeenCalledWith(mockCliente.dniClient, jasmine.any(Object));
    expect(window.alert).toHaveBeenCalledWith('Cliente actualizado');
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();

    expect(clienteService.crear).not.toHaveBeenCalled();
    expect(clienteService.actualizar).not.toHaveBeenCalled();
  });

  it('should handle error on submit', () => {
    spyOn(window, 'alert');
    spyOn(console, 'error');

    component.form.patchValue({
      dniClient: '1234567890',
      nameClient: 'Juan',
      surnameClient: 'Pérez',
      addressClient: 'Calle 123'
    });

    clienteService.crear.and.returnValue(throwError(() => ({ status: 500, error: { message: 'Server error' } })));

    component.onSubmit();

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Error: Server error');
  });

  it('should emit guardar event on successful submit', (done) => {
    clienteService.crear.and.returnValue(of(mockCliente));
    spyOn(window, 'alert');

    component.guardar.subscribe(() => {
      expect(true).toBeTrue();
      done();
    });

    component.form.patchValue({
      dniClient: '1234567890',
      nameClient: 'Juan',
      surnameClient: 'Pérez',
      addressClient: 'Calle 123'
    });

    component.onSubmit();
  });

  it('should emit cancelar event on reset', (done) => {
    component.cancelar.subscribe(() => {
      expect(true).toBeTrue();
      done();
    });

    component.reset();
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('emailClient');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalse();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTrue();
  });

  it('should validate phone format (Ecuador)', () => {
    const phoneControl = component.form.get('phoneClient');

    phoneControl?.setValue('123456789');
    expect(phoneControl?.valid).toBeFalse();

    phoneControl?.setValue('0987654321');
    expect(phoneControl?.valid).toBeTrue();
  });
});
