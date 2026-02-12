import { Injectable, signal } from '@angular/core';

/**
 * Tipos de toast
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Interfaz de un toast individual
 */
export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

/**
 * Servicio de notificaciones toast
 * Gestiona la cola de notificaciones y su visualización
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastIdCounter = 0;
  private toastsSignal = signal<Toast[]>([]);

  // Exponer toasts como signal de solo lectura
  public toasts = this.toastsSignal.asReadonly();

  // Duraciones predeterminadas por tipo
  private defaultDurations: Record<ToastType, number> = {
    success: 3000,
    error: 5000,
    warning: 4000,
    info: 3000
  };

  constructor() {}

  /**
   * Mostrar toast de éxito
   */
  success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  /**
   * Mostrar toast de error
   */
  error(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  /**
   * Mostrar toast de advertencia
   */
  warning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }

  /**
   * Mostrar toast de información
   */
  info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  /**
   * Mostrar un toast
   */
  private show(type: ToastType, message: string, duration?: number): void {
    const toast: Toast = {
      id: this.toastIdCounter++,
      type,
      message,
      duration: duration || this.defaultDurations[type]
    };

    // Agregar toast a la cola
    this.toastsSignal.update(toasts => [...toasts, toast]);

    // Remover automáticamente después de la duración
    setTimeout(() => {
      this.remove(toast.id);
    }, toast.duration);
  }

  /**
   * Remover un toast por ID
   */
  remove(id: number): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }

  /**
   * Limpiar todos los toasts
   */
  clear(): void {
    this.toastsSignal.set([]);
  }
}
