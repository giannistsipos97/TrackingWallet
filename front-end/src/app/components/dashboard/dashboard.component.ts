import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account } from '../../models/Account';
import { AddAccountDialogComponent } from '../add-account-dialog/add-account-dialog.component';
import { AddTransactionDialogComponent } from '../add-transaction-dialog/add-transaction-dialog.component';
import { Router } from '@angular/router';
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
  accountsStore = inject(AccountsStore);
  router = inject(Router);

  selectedAccount = signal<Account | null>(null);
  isModalOpen = signal(false);
  accounts = this.accountsStore.accounts;
  transactionModalOpen = signal(false);
  activeTransactionType = signal<'income' | 'expense'>('expense');
  transactionAccount = signal<Account | null>(null);

  ngOnInit() {
    this.loadAccounts();
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
}
