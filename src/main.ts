import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Sentry
import * as Sentry from "@sentry/angular-ivy";


if (environment.production) {
  Sentry.init({
    dsn: "https://f190359aceee4d438f6156b07d882424@o1102475.ingest.sentry.io/6129057",
    integrations: [
      // Registers and configures the Tracing integration,
      // which automatically instruments your application to monitor its
      // performance, including custom Angular routing instrumentation
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
      // Registers the Replay integration,
      // which automatically captures Session Replays
      new Sentry.Replay(),
    ],
  
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  
    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", "https://monsterdex.info","https://www.monsterdex.info"],
  
    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
  
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
