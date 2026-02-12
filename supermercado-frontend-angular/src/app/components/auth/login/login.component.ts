import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginData = { username: '', password: '' };

  // 🔥 Estado reactivo con signals
  loginError = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onLogin() {

    if (!this.loginData.username || !this.loginData.password) {
      const msg = 'Por favor completa todos los campos.';
      this.loginError.set(msg);
      this.toastService.warning(msg);
      return;
    }

    this.isLoading.set(true);
    this.loginError.set('');

    this.authService.login(this.loginData).subscribe({
      next: () => {

        const user = this.userService.getCurrentUser();

        if (!user) {
          const msg = 'Error al obtener información del usuario';
          this.isLoading.set(false);
          this.loginError.set(msg);
          this.toastService.error(msg);
          return;
        }

        this.toastService.success(`¡Bienvenido, ${user.username}!`);

        const dashboardPaths: Record<string, string> = {
          administrador: '/admin',
          empleado: '/empleado',
          cliente: '/cliente'
        };

        const targetPath = dashboardPaths[user.rol] || '/cliente';
        this.router.navigate([targetPath]);
      },

      error: (err) => {
        const errorMsg =
          err.error?.msg ||
          'Credenciales incorrectas. Por favor, verifica tus datos.';

        this.isLoading.set(false);
        this.loginError.set(errorMsg);
        this.toastService.error(errorMsg);
      }
    });
  }
}
