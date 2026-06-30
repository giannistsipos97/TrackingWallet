import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../models/Transaction';
import { TransactionListComponent } from '../transaction-list/transaction-list.component';
import { TransactionService } from '../../services/transaction.service';
import { GLOBAL_MONTHS } from '../../shared/constants/date.constants';

interface MonthOption {
  label: string;
  month: number;
  year: number;
}

@Component({
  selector: 'app-view-all-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionListComponent],
  templateUrl: './view-all-transactions.component.html',
  styleUrl: './view-all-transactions.component.scss',
})
export class ViewAllTransactionsComponent implements OnInit {
  private transactionService = inject(TransactionService);

  //request the specific account identifier instead of the raw data list
  @Input({ required: true }) accountId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() editTransaction = new EventEmitter<Transaction>();

  transactions = signal<Transaction[]>([]);
  monthOptions: MonthOption[] = [];
  selectedMonthSelection = signal<MonthOption | null>(null);
  isLoading = signal(false);

  ngOnInit() {
    this.generateMonthOptions();
    this.loadMonthData();
  }

  generateMonthOptions() {
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      this.monthOptions.push({
        label: `${GLOBAL_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        month: d.getMonth(),
        year: d.getFullYear(),
      });
    }
    this.selectedMonthSelection.set(this.monthOptions[0]);
  }

  onMonthChange() {
    this.loadMonthData();
  }

  loadMonthData() {
    const filter = this.selectedMonthSelection();
    if (!this.accountId || !filter) return;

    this.isLoading.set(true);

    this.transactionService
      .getTransactions(this.accountId, filter.month, filter.year)
      .subscribe({
        next: (data) => {
          this.transactions.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to parse financial lists:', err);
          this.isLoading.set(false);
        },
      });
  }

  onEdit(tx: Transaction) {
    this.editTransaction.emit(tx);
  }
}
