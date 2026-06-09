import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/Account';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Transaction } from '../../models/Transaction';
import { EditBalanceModalComponent } from '../edit-balance-modal/edit-balance-modal.component';
import { HeaderService } from '../../services/header.service';
import { EditTransactionComponent } from '../edit-transaction/edit-transaction.component';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/Category';
import { TransactionService } from '../../services/transaction.service';
import { ViewAllTransactionsComponent } from '../view-all-transactions/view-all-transactions.component';
import { TransactionListComponent } from '../transaction-list/transaction-list.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AddTransactionDialogComponent } from '../add-transaction-dialog/add-transaction-dialog.component';

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
  accountService = inject(AccountService);
  headerService = inject(HeaderService);
  categoriesService = inject(CategoryService);
  transactionService = inject(TransactionService);

  account = signal<Account | null>(null);
  transactions = signal<Transaction[]>([]);
  summary = signal<any | null>(null);
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
    this.accountService.getAccountById(id).subscribe((data) => {
      this.account.set(data.account);
      this.transactions.set(data.transactions);
      this.summary.set(data.summary);
    });
  }

  // loadTransactions(accountId: string) {
  //   this.transactionService
  //     .getAccountTransactions(accountId)
  //     .subscribe((transactions) => {
  //       this.transactions.set(transactions);
  //     });
  // }

  handleBalanceUpdate(account: Account) {
    this.showEditModal.set(false);
    this.account.set(account);
  }

  openAddTransactionModal(type: 'income' | 'expense'): void {
    this.activeTransactionType = signal<'income' | 'expense'>(type);
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
      this.account.set(response.account);
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

    this.accountService.deleteAccount(currentAccount._id).subscribe({
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
