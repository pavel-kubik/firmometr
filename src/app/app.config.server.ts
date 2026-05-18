import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { appConfig } from './app.config';
import { AuthService } from './core/services/auth.service';
import { ServerAuthService } from './core/services/auth.service.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideNoopAnimations(),
    { provide: AuthService, useClass: ServerAuthService },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
