import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from '../../services/header.service';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/User';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  headerService = inject(HeaderService);
  themeService = inject(ThemeService);
  router = inject(Router);

  userProfile = signal<User | null>(null);

  avatarLetters = computed(() => {
    const user = this.userProfile();

    if (!user || !user.name) return '??';

    const names = user.name.trim().split(/\s+/);
    const firstLetter = names[0]?.charAt(0).toUpperCase() || '';
    const secondLetter = names[1]?.charAt(0).toUpperCase() || '';

    return firstLetter + secondLetter;
  });

  isDashboard = computed(() => this.router.url === '/dashboard');

  ngOnInit() {
    this.getUserProfile();
  }

  getUserProfile() {
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile.set(profile);

        this.headerService.updateHeader('Welcome back,', profile.name);

        console.log('Profile loaded:', profile);
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        if (err.status === 401) this.authService.logout();
      },
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
  }
}
