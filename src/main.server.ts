import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

const bootstrap = () => bootstrapApplication(AppComponent,   {
    providers: [
        ...config.providers,
      provideAnimations(), // required animations providers
      provideToastr({
        timeOut: 3000, // Set global toastr configuration
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      }), // Toastr providers
    ]
  });

export default bootstrap;
