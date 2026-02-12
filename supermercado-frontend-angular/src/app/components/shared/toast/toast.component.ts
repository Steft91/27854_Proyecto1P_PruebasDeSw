import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';

/**
 * Componente de contenedor de toasts
 * Muestra las notificaciones en la esquina inferior derecha
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  // Animations removed to avoid requiring @angular/animations dependency in minimal setup
})
export class ToastComponent {
  get toasts(): Toast[] {
    return this.toastService.toasts();
  }

  constructor(private toastService: ToastService) {}

  /**
   * Cerrar un toast manualmente
   */
  close(toast: Toast): void {
    this.toastService.remove(toast.id);
  }

  /**
   * Obtener icono según tipo
   */
  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'success': '✓',
      'error': '✕',
      'warning': '⚠',
      'info': 'ℹ'
    };
    return icons[type] || 'ℹ';
  }

  /**
   * Obtener clase CSS según tipo
   */
  getToastClass(type: string): string {
    return `toast-${type}`;
  }
}
