import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  constructor(private http: HttpClient) {}  login(email: string, password: string) {
    // Formato di richiesta modificato per supportare più backend
    // Alcuni backend potrebbero avere requisiti specifici per l'autenticazione
    const payload = {
      email: email,
      password: password
      // Se il backend richiede altri campi, aggiungerli qui
    };
    
    console.log('Sending login request with payload:', payload);
    
    return this.http.post<any>(`${this.apiUrl}/login`, payload, {
      // Configura headers per gestire CORS e JSON
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Impostato su false per prevenire problemi di CORS
      withCredentials: false
    }).pipe(
      tap(response => {
        console.log('Login response:', response);
        // Gestisci diverse possibili strutture della risposta
        const token = typeof response === 'string' 
          ? response 
          : response.token || response.access_token || response.accessToken || response.jwt;
          
        if (token) {
          console.log('Token received and stored');
          localStorage.setItem('jwtToken', token);
          
          // Decodifico il payload del token JWT
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token payload:', payload);
            
            // Se il token ha una scadenza, aggiungi un log
            if (payload.exp) {
              const expireDate = new Date(payload.exp * 1000);
              console.log('Token valido fino a:', expireDate);
            }
          } catch (e) {
            console.error('Errore nel parsing del payload JWT:', e);
          }
        } else {
          console.warn('No token found in response:', response);
        }
      })
    );
  }

  register(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { email, password });
  }
  getToken(): string | null {
    const token = localStorage.getItem('jwtToken');
    
    // Se il token esiste, verifichiamo se è scaduto
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp) {
          const isExpired = Date.now() >= payload.exp * 1000;
          if (isExpired) {
            console.warn('Il token è scaduto, rimuovendolo dal localStorage');
            localStorage.removeItem('jwtToken');
            return null;
          }
        }
      } catch (e) {
        console.error('Errore nel parsing del token JWT:', e);
      }
    }
    
    return token;
  }
  isLoggedIn(): boolean {
    const isLoggedIn = !!this.getToken();
    console.log('Auth status check: isLoggedIn =', isLoggedIn);
    return isLoggedIn;
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.email; // 'sub' è standard per il soggetto JWT, ma potrebbe essere 'email' in alcuni casi
      } catch (e) {
        console.error('Errore nel recupero dell\'email dal token JWT:', e);
      }
    }
    return null;
  }
  
  logout() {
    localStorage.removeItem('jwtToken');
  }
  
  // Richiedi un reset della password
  requestPasswordReset(email: string) {
    return this.http.post(`${this.apiUrl}/request-reset`, { email });
  }
    // Reimposta la password usando il token
  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }
    // Verifica se l'email esiste nel sistema
  verifyEmail(email: string): Observable<any> {
    const normalizedEmail = email.trim().toLowerCase(); // Normalizza l'email
    console.log('Verifica email con:', normalizedEmail);
    return this.http.post(`${this.apiUrl}/verify-email`, { email: normalizedEmail });
  }// Aggiorna la password dell'utente con la nuova password
  updatePassword(email: string, newPassword: string): Observable<any> {
    console.log('Dati inviati al server:', { email, newPassword });
    return this.http.post(`${this.apiUrl}/update-password`, { 
      email: email.trim().toLowerCase(), // Normalizza l'email per evitare problemi di case sensitivity
      newPassword 
    });
  }
}