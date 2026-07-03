import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/User';
import { CommonModule } from '@angular/common';
import { Account } from '../../models/Account';
import { AddAccountDialogComponent } from '../add-account-dialog/add-account-dialog.component';
import { AddTransactionDialogComponent } from '../add-transaction-dialog/add-transaction-dialog.component';
import { Router } from '@angular/router';
import { HeaderService } from '../../services/header.service';
import { AccountsStore } from '../../stores/accounts.store';

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
  accountsStore = inject(AccountsStore);
  router = inject(Router);
  headerService = inject(HeaderService);

  userProfile = signal<User | null>(null);
  selectedAccount = signal<Account | null>(null);
  isModalOpen = signal(false);
  accounts = this.accountsStore.accounts;
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
    this.accountsStore.loadAccounts();
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
    this.accountsStore.updateAccount(updatedAccount);

    if (this.selectedAccount()?._id === updatedAccount._id) {
      this.selectedAccount.set(updatedAccount);
    }
  }

  viewAccountDetails(id: string) {
    this.router.navigate(['/account', id]);
  }

  updateData() {
    this.isModalOpen.set(false);
    this.accountsStore.loadAccounts(true);
  }

  logout() {
    this.authService.logout();
  }
}
