import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Sentry
import * as Sentry from "@sentry/angular";
import { BrowserTracing } from "@sentry/tracing";


if (environment.production) {
  Sentry.init({
    dsn: "https://f190359aceee4d438f6156b07d882424@o1102475.ingest.sentry.io/6129057",
    integrations: [
      // Registers and configures the Tracing integration,
      // which automatically instruments your application to monitor its
      // performance, including custom Angular routing instrumentation
      new BrowserTracing({
        tracePropagationTargets: ["https://goren-pnp.de","https://www.goren-pnp.de"],
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],
  
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
  
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
