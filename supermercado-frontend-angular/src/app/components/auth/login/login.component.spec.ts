import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty credentials and no error', () => {
    expect(component.loginData.username).toBe('');
    expect(component.loginData.password).toBe('');
    expect(component.loginError()).toBe('');
    expect(component.isLoading()).toBe(false);
  });

  describe('onLogin validation', () => {
    it('should show warning if username is empty', () => {
      component.loginData.username = '';
      component.loginData.password = 'password123';

      component.onLogin();

      expect(component.loginError()).toContain('completa todos los campos');
      expect(toastService.warning).toHaveBeenCalledWith(jasmine.stringMatching(/completa todos los campos/));
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should show warning if password is empty', () => {
      component.loginData.username = 'testuser';
      component.loginData.password = '';

      component.onLogin();

      expect(component.loginError()).toContain('completa todos los campos');
      expect(toastService.warning).toHaveBeenCalled();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should show warning if both fields are empty', () => {
      component.loginData.username = '';
      component.loginData.password = '';

      component.onLogin();

      expect(toastService.warning).toHaveBeenCalled();
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('successful login', () => {
    beforeEach(() => {
      component.loginData.username = 'admin';
      component.loginData.password = 'password123';
      authService.login.and.returnValue(of({ token: 'fake-token', user: { id: '1', username: 'admin', email: 'admin@test.com', rol: 'administrador' } }));
    });

    it('should navigate to admin dashboard for administrador role', () => {
      userService.getCurrentUser.and.returnValue({
        id: '1',
        username: 'admin',
        email: 'admin@test.com',
        rol: 'administrador'
      });
      spyOn(router, 'navigate');

      component.onLogin();

      expect(authService.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'password123'
      });
      expect(toastService.success).toHaveBeenCalledWith('¡Bienvenido, admin!');
      expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should navigate to empleado dashboard for empleado role', () => {
      userService.getCurrentUser.and.returnValue({
        id: '2',
        username: 'empleado1',
        email: 'emp@test.com',
        rol: 'empleado'
      });
      spyOn(router, 'navigate');

      component.onLogin();

      expect(toastService.success).toHaveBeenCalledWith('¡Bienvenido, empleado1!');
      expect(router.navigate).toHaveBeenCalledWith(['/empleado']);
    });

    it('should navigate to cliente dashboard for cliente role', () => {
      userService.getCurrentUser.and.returnValue({
        id: '3',
        username: 'cliente1',
        email: 'cliente@test.com',
        rol: 'cliente'
      });
      spyOn(router, 'navigate');

      component.onLogin();

      expect(toastService.success).toHaveBeenCalledWith('¡Bienvenido, cliente1!');
      expect(router.navigate).toHaveBeenCalledWith(['/cliente']);
    });

    it('should default to cliente dashboard for unknown role', () => {
      userService.getCurrentUser.and.returnValue({
        id: '4',
        username: 'user',
        email: 'user@test.com',
        rol: 'unknown' as any
      });
      spyOn(router, 'navigate');

      component.onLogin();

      expect(router.navigate).toHaveBeenCalledWith(['/cliente']);
    });

    it('should set isLoading to true during login', () => {
      userService.getCurrentUser.and.returnValue({
        id: '1',
        username: 'admin',
        email: 'admin@test.com',
        rol: 'administrador'
      });

      expect(component.isLoading()).toBe(false);
      component.onLogin();
      expect(component.isLoading()).toBe(true);
    });

    it('should clear login error on successful login', () => {
      component.loginError.set('Previous error');
      userService.getCurrentUser.and.returnValue({
        id: '1',
        username: 'admin',
        email: 'admin@test.com',
        rol: 'administrador'
      });

      component.onLogin();

      expect(component.loginError()).toBe('');
    });
  });

  describe('login errors', () => {
    beforeEach(() => {
      component.loginData.username = 'testuser';
      component.loginData.password = 'wrongpass';
    });

    it('should handle login error with custom message', () => {
      const errorResponse = {
        error: { msg: 'Usuario o contraseña incorrectos' }
      };
      authService.login.and.returnValue(throwError(() => errorResponse));
      spyOn(router, 'navigate');

      component.onLogin();

      expect(component.isLoading()).toBe(false);
      expect(component.loginError()).toBe('Usuario o contraseña incorrectos');
      expect(toastService.error).toHaveBeenCalledWith('Usuario o contraseña incorrectos');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle login error with default message', () => {
      const errorResponse = { error: {} };
      authService.login.and.returnValue(throwError(() => errorResponse));

      component.onLogin();

      expect(component.loginError()).toContain('Credenciales incorrectas');
      expect(toastService.error).toHaveBeenCalledWith(jasmine.stringMatching(/Credenciales incorrectas/));
    });

    it('should handle getUserCurrentUser returning null after login', () => {
      authService.login.and.returnValue(of({ token: 'fake-token', user: { id: '1', username: 'admin', email: 'admin@test.com', rol: 'administrador' } }));
      userService.getCurrentUser.and.returnValue(null);
      spyOn(router, 'navigate');

      component.onLogin();

      expect(component.isLoading()).toBe(false);
      expect(component.loginError()).toContain('Error al obtener información del usuario');
      expect(toastService.error).toHaveBeenCalledWith('Error al obtener información del usuario');
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
