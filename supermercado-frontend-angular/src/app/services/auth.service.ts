import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document,
    private userService: UserService
  ) {}

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          // Guardar información del usuario completa (incluyendo rol)
          this.userService.setUser(response.user);
        }
      })
    );
  }

  register(userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    // Limpiar información del usuario
    this.userService.clearUser();
    // Usamos this.document en lugar de window directo
    this.document.location.reload();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
