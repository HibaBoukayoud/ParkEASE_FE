import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { jwtInterceptor } from './services/jwt.interceptor';
import { debugInterceptor } from './services/debug.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([debugInterceptor, jwtInterceptor])),
        provideAnimations(),
        importProvidersFrom(FormsModule, ReactiveFormsModule)
    ]
};