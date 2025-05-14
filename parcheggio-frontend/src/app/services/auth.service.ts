import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<string>(`${this.apiUrl}/login`, { username, password })
      .pipe(tap(token => localStorage.setItem('jwtToken', token)));
  }

  register(username: string, email: string, password: string) {
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
}