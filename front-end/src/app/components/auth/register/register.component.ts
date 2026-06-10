import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  private emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // 2. Password Regex: Min 8 chars, at least one letter and one number
  private passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  isEmailValid = computed(() => this.emailRegex.test(this.email()));
  isPasswordValid = computed(() => this.passwordRegex.test(this.password()));

  // Using signals for form state
  username = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  touched = signal({
    username: false,
    email: false,
    password: false,
    confirm: false,
  });
  errorMessage = signal('');

  passwordsMatch = computed(() => this.password() === this.confirmPassword());

  canSubmit = computed(
    () =>
      this.isEmailValid() &&
      this.isPasswordValid() &&
      this.username().length > 1 &&
      this.password() === this.confirmPassword(),
  );

  handleRegister() {
    // Set all to touched on submit
    this.touched.set({
      username: true,
      email: true,
      password: true,
      confirm: true,
    });

    if (
      !this.passwordsMatch() ||
      !this.email() ||
      !this.password() ||
      this.password().length < 6
    ) {
      return;
    }

    this.authService
      .signUp({
        name: this.username(),
        email: this.email(),
        password: this.password(),
      })
      .subscribe({
        // next: () => this.router.navigate(['/dashboard']),
        error: (err) => this.errorMessage.set(err.error?.message || 'Error'),
      });
  }
}
