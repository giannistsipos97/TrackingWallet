import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { finalize, shareReplay, tap } from 'rxjs/operators';
import { User } from '../models/User';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api/auth';
  private profileRequest$?: Observable<User>;

  // 1. The BehaviorSubject: Holds the "Source of Truth"
  // It starts with null, but as soon as someone subscribes, they get the latest value.
  private userSubject = new BehaviorSubject<User | null>(null);

  // 2. The Observable: For components that prefer RxJS (async pipe, etc.)
  user$ = this.userSubject.asObservable();

  // 3. The Signal: For your Emerald UI components
  // We initialize it based on the Subject
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(!!localStorage.getItem('token'));

  signUp(userData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/signup`, userData)
      .pipe(tap((response) => this.saveSession(response)));
  }

  login(credentials: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, credentials)
      .pipe(tap((response) => this.saveSession(response)));
  }

  getUserProfile(forceRefresh = false): Observable<User> {
    const cachedUser = this.currentUser();

    if (cachedUser && !forceRefresh) {
      return of(cachedUser);
    }

    if (!this.profileRequest$ || forceRefresh) {
      this.profileRequest$ = this.http.get<User>(`${this.apiUrl}/me`).pipe(
        tap((user) => {
          // Update both the Subject and the Signal
          this.userSubject.next(user);
          this.currentUser.set(user);
        }),
        finalize(() => {
          this.profileRequest$ = undefined;
        }),
        shareReplay(1),
      );
    }

    return this.profileRequest$;
  }

  private saveSession(response: any) {
    localStorage.setItem('token', response.token);
    this.userSubject.next(response.user);
    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
  }

  logout() {
    localStorage.removeItem('token');
    this.userSubject.next(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }
}
