import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
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
        this.isSubmitting = false;
        this.successMsg = '¡Registro exitoso! Redirigiendo a inicio de sesión...';
        this.errorMsg = '';

        // Redirigir a login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = err.error?.message || err.error?.msg || 'Error al registrar usuario.';
        this.isSubmitting = false;
        this.successMsg = '';
      }
    });
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