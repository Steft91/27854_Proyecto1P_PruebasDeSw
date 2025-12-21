import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() registerSuccess = new EventEmitter<void>();

  registerData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: ''
  };

  errorMsg = '';
  loading = false;

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
      this.errorMsg = 'Todos los campos son obligatorios.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMsg = 'El formato del email no es válido.';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    if (!this.registerData.rol) {
      this.errorMsg = 'Debes seleccionar un rol.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const { confirmPassword, ...payload } = this.registerData;
    
    this.authService.register(payload).subscribe({
      next: () => {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        this.loading = false;
        this.registerSuccess.emit();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = err.error?.message || 'Error al registrar usuario. Verifica los datos.';
        this.loading = false;
      }
    });
  }
}