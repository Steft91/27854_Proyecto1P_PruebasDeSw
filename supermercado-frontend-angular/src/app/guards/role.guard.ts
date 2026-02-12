import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Guard para proteger rutas basándose en roles de usuario
 *
 * Uso en routes:
 * {
 *   path: 'admin',
 *   component: AdminDashboard,
 *   canActivate: [roleGuard],
 *   data: { roles: ['administrador'] }
 * }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  // Verificar autenticación
  const currentUser = userService.getCurrentUser();

  if (!currentUser) {
    // Usuario no autenticado, redirigir a login
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Obtener roles permitidos desde route data
  const allowedRoles = route.data['roles'] as string[];

  // Si no hay roles especificados, permitir acceso (solo requiere auth)
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Verificar si el usuario tiene uno de los roles permitidos
  if (allowedRoles.includes(currentUser.rol)) {
    return true;
  }

  // Usuario autenticado pero sin permisos, redirigir al dashboard apropiado
  const redirectPaths: Record<string, string> = {
    administrador: '/admin',
    empleado: '/empleado',
    cliente: '/cliente'
  };

  const dashboardPath = redirectPaths[currentUser.rol];

  if (dashboardPath && state.url !== dashboardPath) {
    // Redirigir al dashboard correcto si no está ya allí
    router.navigate([dashboardPath]);
  } else {
    // Si ya está en su dashboard o no hay ruta definida, ir a unauthorized
    router.navigate(['/unauthorized']);
  }

  return false;
};
