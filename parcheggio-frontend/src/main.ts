import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Importa le rotte
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes), // Configura il router con le rotte
        provideHttpClient(), // Fornisce il client HTTP per le richieste
        provideAnimations() // Fornisce le animazioni per Angular Material
    ]
});