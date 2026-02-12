import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Guard simple para verificar autenticación
 * No verifica roles específicos, solo que el usuario esté autenticado
 *
 * Uso en routes:
 * {
 *   path: 'some-path',
 *   component: SomeComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const currentUser = userService.getCurrentUser();

  if (currentUser) {
    return true;
  }

  // Usuario no autenticado, redirigir a login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
