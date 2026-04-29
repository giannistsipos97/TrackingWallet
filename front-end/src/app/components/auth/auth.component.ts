import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
// Import your new components
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  public themeService = inject(ThemeService);

  private router = inject(Router);
  isWelcomePage(): boolean {
    return this.router.url === '/auth';
  }

  navigateTo(path: string) {
    this.router.navigate([`/auth/${path}`]);
  }
}
