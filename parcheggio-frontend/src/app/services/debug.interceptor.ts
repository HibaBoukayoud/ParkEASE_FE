import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const debugInterceptor: HttpInterceptorFn = (req, next) => {
  // Log della richiesta
  console.log(`📤 Richiesta HTTP:`, {
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body
  });
  
  return next(req).pipe(
    tap({
      next: (event) => {
        // Log della risposta di successo
        if (event.type !== 0) { // 0 è il tipo HttpEventType.Sent
          console.log(`📥 Risposta HTTP:`, {
            url: req.url,
            status: 'status' in event ? event.status : 'N/A',
            body: 'body' in event ? event.body : 'N/A'
          });
        }
      },
      error: (error) => {
        // Log dell'errore
        console.error(`❌ Errore HTTP per ${req.url}:`, {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
      }
    })
  );
};
