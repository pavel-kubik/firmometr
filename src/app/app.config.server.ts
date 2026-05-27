import { ApplicationConfig, Injectable, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslocoLoader, TRANSLOCO_LOADER } from '@jsverse/transloco';
import { readFileSync } from 'fs';
import { join } from 'path';
import { of } from 'rxjs';
import { appConfig } from './app.config';
import { AuthService } from './core/services/auth.service';
import { ServerAuthService } from './core/services/auth.service.server';

@Injectable({ providedIn: 'root' })
class ServerTranslocoLoader implements TranslocoLoader {
  getTranslation(lang: string) {
    const path = join(process.cwd(), `public/assets/i18n/${lang}.json`);
    return of(JSON.parse(readFileSync(path, 'utf-8')));
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideNoopAnimations(),
    { provide: AuthService, useClass: ServerAuthService },
    { provide: TRANSLOCO_LOADER, useClass: ServerTranslocoLoader },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
