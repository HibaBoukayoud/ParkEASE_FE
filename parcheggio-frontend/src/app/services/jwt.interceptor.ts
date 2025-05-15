import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    console.log('JWT Interceptor: Aggiunta del token all\'header', token.substring(0, 10) + '...');
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  } else {
    console.log('JWT Interceptor: Nessun token disponibile');
  }
  
  return next(req);
};