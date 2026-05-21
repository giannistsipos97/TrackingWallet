import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/User';
import { AccountService } from '../../services/account.service';
import { CommonModule } from '@angular/common';
import { Account } from '../../models/Account';
import { AddAccountDialogComponent } from '../add-account-dialog/add-account-dialog.component';
import { AddTransactionDialogComponent } from '../add-transaction-dialog/add-transaction-dialog.component';
import { Router } from '@angular/router';
import { HeaderService } from '../../services/header.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AddAccountDialogComponent,
    AddTransactionDialogComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  accountService = inject(AccountService);
  router = inject(Router);
  headerService = inject(HeaderService);

  userProfile = signal<User | null>(null);
  selectedAccount = signal<Account | null>(null);
  isModalOpen = signal(false);
  accounts = signal<Account[]>([]);
  transactionModalOpen = signal(false);
  activeTransactionType = signal<'income' | 'expense'>('expense');
  transactionAccount = signal<Account | null>(null);

  ngOnInit() {
    this.getUserProfile();
    this.loadAccounts();
  }

  getUserProfile() {
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        this.headerService.updateHeader('Welcome back,', profile.name);
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        if (err.status === 401) this.authService.logout();
      },
    });
  }

  loadAccounts() {
    this.accountService.getAccounts().subscribe((accounts) => {
      this.accounts.set(accounts);
      // if (accounts.length > 0 && !this.selectedAccount()) {
      //   this.selectedAccount.set(accounts[0]);
      // }
    });
  }

  openAddAccountDialog() {
    this.isModalOpen.set(true);
  }

  openTransaction(acc: Account, type: 'income' | 'expense') {
    this.transactionAccount.set(acc);
    this.activeTransactionType.set(type);
    this.transactionModalOpen.set(true);
  }

  updateBalance(updatedAccount: Account) {
    this.accounts.update((accs) =>
      accs.map((a) => (a._id === updatedAccount._id ? updatedAccount : a)),
    );

    if (this.selectedAccount()?._id === updatedAccount._id) {
      this.selectedAccount.set(updatedAccount);
    }
  }

  viewAccountDetails(id: string) {
    this.router.navigate(['/account', id]);
  }

  updateData() {
    this.isModalOpen.set(false);
    this.loadAccounts();
  }

  logout() {
    this.authService.logout();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
