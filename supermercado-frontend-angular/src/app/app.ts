import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/shared/toast/toast.component';

/**
 * Componente raíz de la aplicación
 *
 * Este componente simplemente renderiza el router-outlet.
 * El sistema de routing maneja toda la navegación y renderizado de componentes
 * basándose en la URL y los guards de autenticación/roles.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // El componente principal ahora es solo un shell para el router
  // Toda la lógica de autenticación y navegación está en:
  // - LoginComponent: Maneja el login
  // - Guards: Protegen rutas según autenticación/roles
  // - UserService: Mantiene el estado del usuario
  // - Dashboard components: Manejan la UI específica de cada rol
}