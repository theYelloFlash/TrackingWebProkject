import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';


bootstrapApplication(AppComponent,   {
    providers: [
    ...appConfig.providers,
    provideAnimations(), // required animations providers
    provideToastr({
        timeOut: 3000, // Set global toastr configuration
        positionClass: 'toast-top-right',
        preventDuplicates: true,
    }),
    provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    })
]
  })
  .catch((err) => console.error(err));
