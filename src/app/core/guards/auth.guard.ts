import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { from, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return from(auth.client.auth.getSession()).pipe(
    map(({ data }) => {
      if (data.session?.user) return true;
      return router.createUrlTree(['/register'], { queryParams: { returnUrl: state.url, source: 'auth_required' } });
    })
  );
};
