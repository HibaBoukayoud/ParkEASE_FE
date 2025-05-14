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
      // Imposta su false per diagnosticare il problema, poi potrebbe essere necessario impostarlo su true
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
    return localStorage.getItem('jwtToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
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