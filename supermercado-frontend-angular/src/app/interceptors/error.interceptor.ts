import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { UserService } from '../services/user.service';

/**
 * Interceptor para manejo global de errores HTTP
 * Muestra notificaciones toast y maneja redirecciones
 */
/* istanbul ignore file */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const userService = inject(UserService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // No mostrar errores para peticiones que ya manejan sus propios errores
      // (las que tienen headers especiales)
      if (req.headers.has('X-Skip-Error-Interceptor')) {
        return throwError(() => error);
      }

      let errorMessage = 'Ha ocurrido un error';

      // Manejar diferentes tipos de errores
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente o de red
        errorMessage = 'Error de conexión. Verifica tu internet.';
        toastService.error(errorMessage);
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 0:
            // Error de red o CORS
            errorMessage = 'No se puede conectar al servidor. Verifica tu conexión.';
            toastService.error(errorMessage);
            break;

          case 400:
            // Bad Request - mostrar mensaje del backend si existe
            errorMessage = error.error?.msg || error.error?.message || 'Datos inválidos';
            // No mostrar toast aquí, dejar que el componente lo maneje
            break;

          case 401:
            // No autorizado - diferenciar entre login fallido y sesión expirada
            // Si es la ruta de login, dejar que el componente maneje el error
            if (req.url.includes('/auth/login')) {
              // No hacer nada, el componente de login manejará el error
              break;
            }

            // Para otras rutas, es sesión expirada
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            toastService.error(errorMessage);

            // Limpiar sesión y redirigir al login
            userService.clearUser();
            localStorage.removeItem('token');

            setTimeout(() => {
              router.navigate(['/login']);
            }, 1500);
            break;

          case 403:
            // Forbidden - sin permisos
            errorMessage = 'No tienes permisos para realizar esta acción.';
            toastService.warning(errorMessage);
            break;

          case 404:
            // No encontrado
            errorMessage = error.error?.msg || 'Recurso no encontrado';
            // No mostrar toast automáticamente, dejar que el componente lo maneje
            break;

          case 500:
          case 502:
          case 503:
          case 504:
            // Errores del servidor
            errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
            toastService.error(errorMessage);
            break;

          default:
            // Otros errores
            errorMessage = error.error?.msg || error.error?.message || 'Error al procesar la solicitud';
            toastService.error(errorMessage);
        }
      }

      // Re-lanzar el error para que los componentes también puedan manejarlo
      return throwError(() => error);
    })
  );
};
