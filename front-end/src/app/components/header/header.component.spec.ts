/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { HeaderComponent } from './header.component';
import { HeaderService } from '../../services/header.service';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockHeaderService: any;
  let mockThemeService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getUserProfile',
      'logout',
    ]);
    mockAuthService.getUserProfile.and.returnValue(
      of({ _id: '1', name: 'John Doe', email: 'john@example.com' }),
    );

    mockHeaderService = {
      title: signal('Dynamic Dashboard Header'),
      subtitle: signal('Overview metrics'),
      updateHeader: jasmine.createSpy('updateHeader'),
      toggleDrawer: jasmine.createSpy('toggleDrawer'),
    };

    mockThemeService = {
      isDarkMode: signal(false),
      toggleTheme: jasmine.createSpy('toggleTheme'),
    };

    mockRouter = {
      url: '/dashboard',
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: HeaderService, useValue: mockHeaderService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the header component instance cleanly', () => {
    expect(component).toBeTruthy();
  });

  it('should parse user names and render the correct initials inside the avatar badge', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const avatarSpan = compiled.querySelector('.rounded-full span');

    expect(component.avatarLetters()).toBe('JD');
    expect(avatarSpan?.textContent?.trim()).toBe('JD');
  });

  it('should dynamically display the header title text from HeaderService data state', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h1Element = compiled.querySelector('h1');

    expect(h1Element?.textContent?.trim()).toBe('Dynamic Dashboard Header');
  });

  it('should trigger headerService.toggleDrawer() when the menu button is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const menuButton = compiled.querySelector(
      'button:has(.fa-bars-staggered), button',
    ) as HTMLButtonElement;

    if (menuButton) {
      menuButton.click();
    }
    expect(mockHeaderService.toggleDrawer).toHaveBeenCalled();
  });

  it('should trigger themeService.toggleTheme() when the theme button is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('button');
    let themeButton: HTMLButtonElement | null = null;

    buttons.forEach((btn) => {
      if (btn.querySelector('.fa-sun') || btn.querySelector('.fa-moon')) {
        themeButton = btn as HTMLButtonElement;
      }
    });

    expect(themeButton).not.toBeNull();
    themeButton!.click();

    expect(mockThemeService.toggleTheme).toHaveBeenCalled();
  });

  it('should display the sun icon when dark mode is true, and moon icon when false', () => {
    mockThemeService.isDarkMode.set(true);
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.fa-sun')).toBeTruthy();
    expect(compiled.querySelector('.fa-moon')).toBeFalsy();

    mockThemeService.isDarkMode.set(false);
    fixture.detectChanges();

    expect(compiled.querySelector('.fa-sun')).toBeFalsy();
    expect(compiled.querySelector('.fa-moon')).toBeTruthy();
  });

  it('should invoke authService.logout() when the logout button is pressed', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logoutIcon = compiled.querySelector('.fa-right-from-bracket');
    const logoutButton = (logoutIcon?.closest('button') ||
      logoutIcon) as HTMLElement;

    expect(logoutButton).toBeTruthy();
    logoutButton.click();

    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
