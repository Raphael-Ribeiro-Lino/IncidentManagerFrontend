import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { jwtDecode } from "jwt-decode";

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (!token || !authService.isTokenValid()) {
    return router.createUrlTree(['/login']);
  }

  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const decoded: any = jwtDecode(token);
  const userRole = decoded?.perfil;

  if (!userRole || !requiredRoles.includes(userRole)) {
      return router.createUrlTree(['home']);
  }

  return true;
};
