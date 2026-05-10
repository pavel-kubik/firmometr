import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

Sentry.init({
  dsn: 'https://98b35f4d7f54606f7eadc18a50e66f9b@o4507279451357184.ingest.de.sentry.io/4511367880179792',
  sendDefaultPii: true,
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
