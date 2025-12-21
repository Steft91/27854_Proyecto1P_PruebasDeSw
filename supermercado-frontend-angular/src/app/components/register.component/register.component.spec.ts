import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['register']);
    authServiceMock.register.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule], 
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('Debe ser inválido si los campos están vacíos', () => {
    expect(component.registerForm.valid).toBeFalse();
    
    const usernameControl = component.registerForm.get('username');
    expect(usernameControl?.valid).toBeFalse();
    expect(usernameControl?.errors?.['required']).toBeTrue();
  });

  it('Debe validar formato de email incorrecto', () => {
    const emailControl = component.registerForm.get('email');
    
    emailControl?.setValue('correo-sin-arroba');
    expect(emailControl?.valid).toBeFalse();
    expect(emailControl?.errors?.['email']).toBeTrue();

    emailControl?.setValue('test@valido.com');
    expect(emailControl?.valid).toBeTrue();
  });

  it('Debe marcar error "mismatch" en el GRUPO si las contraseñas no coinciden', () => {
    component.registerForm.patchValue({
      password: 'password123',
      confirmPassword: 'password999' // Diferente
    });

    component.registerForm.updateValueAndValidity();

    expect(component.registerForm.hasError('mismatch')).toBeTrue();
    expect(component.registerForm.valid).toBeFalse();
  });

  it('Debe ser válido si todos los datos son correctos', () => {
    component.registerForm.patchValue({
      username: 'usuarioTest',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      rol: 'empleado'
    });

    expect(component.registerForm.hasError('mismatch')).toBeFalse();
    expect(component.registerForm.valid).toBeTrue();
  });

  it('Debe llamar a authService.register cuando se hace submit válido', () => {
    spyOn(window, 'alert');

    component.registerForm.patchValue({
      username: 'usuarioTest',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      rol: 'admin'
    });

    component.onSubmit();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      username: 'usuarioTest',
      email: 'test@example.com',
      password: 'password123',
      rol: 'admin'
    });

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/exitoso/i));
    expect(component.registerForm.get('username')?.value).toBeNull(); 
  });

  it('Debe mostrar mensaje de error si el registro falla', () => {
    const errorResponse = { error: { message: 'El correo ya está registrado' } };
    authServiceMock.register.and.returnValue(throwError(() => errorResponse));

    component.registerForm.patchValue({
      username: 'usuarioTest',
      email: 'existente@test.com',
      password: '123456', confirmPassword: '123456', rol: 'empleado'
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMsg).toBe('El correo ya está registrado');

    const errorDiv = fixture.debugElement.query(By.css('.alert-danger'));
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.nativeElement.textContent).toContain('El correo ya está registrado');
  });

  it('El botón de submit debe estar deshabilitado si el formulario es inválido', () => {
    const btn = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(btn.nativeElement.disabled).toBeTrue();

    component.registerForm.patchValue({
      username: 'UsuarioValido', 
      email: 'correo@valido.com',
      password: 'password123',  
      confirmPassword: 'password123',
      rol: 'empleado'
    });

    fixture.detectChanges();

    expect(component.registerForm.valid).toBeTrue();
    expect(btn.nativeElement.disabled).toBeFalse();
  });
});