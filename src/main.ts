import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';


bootstrapApplication(AppComponent,   {
    providers: [
      ...appConfig.providers,
      provideAnimations(), // required animations providers
      provideToastr({
        timeOut: 3000, // Set global toastr configuration
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      }), // Toastr providers
    ]
  })
  .catch((err) => console.error(err));
