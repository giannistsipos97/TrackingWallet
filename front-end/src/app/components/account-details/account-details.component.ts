import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Account } from '../../models/Account';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Transaction } from '../../models/Transaction';
import { EditBalanceModalComponent } from '../edit-balance-modal/edit-balance-modal.component';
import { HeaderService } from '../../services/header.service';
import { EditTransactionComponent } from '../edit-transaction/edit-transaction.component';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/Category';
import { ViewAllTransactionsComponent } from '../view-all-transactions/view-all-transactions.component';
import { TransactionListComponent } from '../transaction-list/transaction-list.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AddTransactionDialogComponent } from '../add-transaction-dialog/add-transaction-dialog.component';
import { AccountsStore } from '../../stores/accounts.store';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    EditBalanceModalComponent,
    EditTransactionComponent,
    ViewAllTransactionsComponent,
    TransactionListComponent,
    ConfirmDialogComponent,
    AddTransactionDialogComponent,
  ],
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.scss',
})
export class AccountDetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  accountsStore = inject(AccountsStore);
  headerService = inject(HeaderService);
  categoriesService = inject(CategoryService);

  account = this.accountsStore.selectedAccount;
  transactions = this.accountsStore.selectedAccountTransactions;
  summary = this.accountsStore.selectedAccountSummary;
  showEditModal = signal(false);
  editTransaction = signal<Transaction | null>(null);
  allCategories = signal<Category[]>([]);
  showAllTransactions = signal(false);
  isDeleting = signal(false);
  isAddModalOpen = signal<boolean>(false);
  activeTransactionType = signal<'income' | 'expense'>('expense');

  ngOnInit() {
    this.headerService.updateHeader(
      'Account Details',
      'View your activity and balance',
    );
    this.categoriesService.getCategories().subscribe((categories) => {
      this.allCategories.set(categories);
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDetails(id);
    }
  }

  loadDetails(id: string) {
    this.accountsStore.loadAccountDetails(id);
  }

  handleBalanceUpdate(account: Account) {
    this.showEditModal.set(false);
    this.accountsStore.updateAccount(account);
  }

  openAddTransactionModal(type: 'income' | 'expense'): void {
    this.activeTransactionType.set(type);
    this.isAddModalOpen.set(true);
  }

  closeAddTransactionModal() {
    this.isAddModalOpen.set(false);
    this.loadDetails(this.account()!._id!);
  }

  openEditTransaction(transaction: any) {
    this.editTransaction.set(transaction);
  }

  handleUpdate(response: any) {
    this.editTransaction.set(null);

    if (response?.account) {
      this.accountsStore.updateAccount(response.account);
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDetails(id);
    }
  }

  onDeleteAccount() {
    const currentAccount = this.account();

    if (!currentAccount || !currentAccount._id) {
      console.error('No account ID found to delete');
      return;
    }

    this.accountsStore.deleteAccount(currentAccount._id).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.isDeleting.set(false);
      },
    });
  }
}
