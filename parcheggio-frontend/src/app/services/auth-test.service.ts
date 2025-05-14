import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthTestService {
  private apiUrl = 'http://localhost:8080/auth';
  
  constructor(private http: HttpClient) {}
  
  /**
   * Testa il servizio di autenticazione con diverse configurazioni
   * @returns Observable con i risultati dei test
   */
  testAuthentication(email: string, password: string): Observable<any> {
    console.log('Starting authentication tests...');
    
    // Test 1: Richiesta standard
    const test1 = this.http.post<any>(`${this.apiUrl}/login`, { 
      email, 
      password 
    }, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      tap(res => console.log('Test 1 (Standard) successful:', res)),
      catchError(err => {
        console.error('Test 1 (Standard) failed:', err);
        return of({ test: 1, success: false, error: err });
      })
    );
    
    // Test 2: Richiesta con withCredentials
    const test2 = this.http.post<any>(`${this.apiUrl}/login`, { 
      email, 
      password 
    }, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    }).pipe(
      tap(res => console.log('Test 2 (withCredentials) successful:', res)),
      catchError(err => {
        console.error('Test 2 (withCredentials) failed:', err);
        return of({ test: 2, success: false, error: err });
      })
    );
    
    // Test 3: Richiesta con username invece di email
    const test3 = this.http.post<any>(`${this.apiUrl}/login`, { 
      username: email, 
      password 
    }).pipe(
      tap(res => console.log('Test 3 (username) successful:', res)),
      catchError(err => {
        console.error('Test 3 (username) failed:', err);
        return of({ test: 3, success: false, error: err });
      })
    );
    
    // Test 4: Richiesta a un endpoint alternativo (se supportato dal backend)
    const test4 = this.http.post<any>(`${this.apiUrl}/signin`, { 
      email, 
      password 
    }).pipe(
      tap(res => console.log('Test 4 (signin) successful:', res)),
      catchError(err => {
        console.error('Test 4 (signin) failed:', err);
        return of({ test: 4, success: false, error: err });
      })
    );
    
    // Esegui i test in sequenza
    console.log('Running authentication tests...');
    
    // Esegui solo il primo test per ora e usa i risultati per determinare i passi successivi
    return test1.pipe(
      catchError(error => {
        console.error('Authentication test failed:', error);
        return throwError(() => error);
      })
    );
  }
}
