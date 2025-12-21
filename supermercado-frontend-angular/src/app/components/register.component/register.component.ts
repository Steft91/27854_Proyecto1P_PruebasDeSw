import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // <--- Cambiado a ReactiveFormsModule
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() registerSuccess = new EventEmitter<void>();

  registerForm: FormGroup;
  isSubmitting = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]], // Validador de email nativo
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      rol: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator }); // Validador grupal
  }

  // Validador personalizado para verificar que las contraseñas coincidan
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    // Resetear mensaje de error previo
    this.errorMsg = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // Muestra los errores en el HTML
      return;
    }

    this.isSubmitting = true;

    // Extraemos los valores y descartamos confirmPassword para el payload
    const formValues = this.registerForm.getRawValue();
    const { confirmPassword, ...payload } = formValues;

    this.authService.register(payload).subscribe({
      next: () => {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        this.isSubmitting = false;
        this.registerSuccess.emit();
        this.registerForm.reset();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = err.error?.message || err.error?.msg || 'Error al registrar usuario.';
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.registerForm.reset();
    this.errorMsg = '';
    this.cancel.emit();
  }

  // Helpers para el HTML
  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasPasswordMismatch(): boolean {
    return this.registerForm.hasError('mismatch') && 
          (this.registerForm.get('confirmPassword')?.touched || false);
  }
}