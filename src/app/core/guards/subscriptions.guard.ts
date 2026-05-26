import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export const subscriptionsGuard: CanActivateFn = () =>
  environment.subscriptionsEnabled ? true : inject(Router).createUrlTree(['/ceny']);
