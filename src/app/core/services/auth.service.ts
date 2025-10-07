import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, LoginResponse, User } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'authToken';
  private userKey = 'currentUser';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.saveToken(response.token);
            this.saveUser(response.user);
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.saveToken(response.token);
            this.saveUser(response.user);
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): void {
    this.removeToken();
    this.removeUser();
    this.currentUserSubject.next(null);
  }

  // Token management
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // User management
  saveUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  removeUser(): void {
    localStorage.removeItem(this.userKey);
  }

  // Authentication state
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // TODO: Optionally check token expiration
    return true;
  }

  // Validate token with API
  validateToken(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/validate-token`, {});
  }

  // Get user profile
  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/Auth/profile`);
  }
}