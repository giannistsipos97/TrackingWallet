import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/Transaction';
import { Account } from '../../models/Account';
import { AccountService } from '../../services/account.service';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [BaseChartDirective, FormsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);

  transactions = signal<Transaction[]>([]);
  accounts = signal<Account[]>([]);
  selectedAccount = signal<Account | null>(null);
  selectedAccountId = signal<string>('');

  selectedMonth = signal<string>(
    (() => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    })(),
  );

  // Mock available months list for dropdown options
  availableMonths = signal<string[]>(['2026-06', '2026-05', '2026-04']);

  formatMonthLabel(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  ngOnInit() {
    this.accountService.getAccounts().subscribe({
      next: (fetchedAccounts: Account[]) => {
        this.accounts.set(fetchedAccounts);
        console.log(
          'Fetched accounts for analytics dropdown:',
          fetchedAccounts,
        );

        if (fetchedAccounts.length > 0 && !this.selectedAccountId()) {
          const firstAccountId = fetchedAccounts[0]._id ?? '';

          this.selectedAccountId.set(firstAccountId);

          this.getAccountTransactions(firstAccountId);
        }
      },
      error: (err) => {
        console.error('Failed to load accounts for analytics dropdown:', err);
      },
    });
  }

  onAccountChange(newAccountId: string): void {
    this.selectedAccountId.set(newAccountId);

    if (newAccountId.trim() !== '') {
      this.getAccountTransactions(newAccountId);
    }
  }

  getAccountTransactions(accountId: string): void {
    this.accountService.getAccountById(accountId).subscribe({
      next: (data) => {
        this.selectedAccount.set(data.account);
        this.transactions.set(data.transactions);
      },
      error: (err) => {
        console.error(`Failed to load account data for ${accountId}:`, err);
      },
    });
  }

  // =========================================================
  // 📊 MOCKUP CHART CONFIGURATIONS (Chart.js Objects)
  // =========================================================

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { weight: 'bold' } } },
    },
    scales: {
      y: { grid: { color: 'rgba(148, 163, 184, 0.1)' } },
      x: { grid: { display: false } },
    },
  };

  barChartData = computed<ChartData<'bar'>>(() => {
    return {
      labels: ['June 2026'],
      datasets: [
        {
          data: [2150],
          label: 'Income',
          backgroundColor: '#10b981',
          borderRadius: 6,
        }, // Emerald Green
        {
          data: [700],
          label: 'Expenses',
          backgroundColor: '#f43f5e',
          borderRadius: 6,
        }, // Rose Red
      ],
    };
  });

  // =========================================================
  // 📊 DONUT CHART CONFIGURATIONS (Chart.js Objects)
  // =========================================================
  donutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 16, font: { size: 12 } },
      },
    },
    cutout: '70%', // Makes the inner donut ring look ultra-modern and slim
  };

  donutChartData = computed<ChartData<'doughnut'>>(() => {
    return {
      labels: ['Rent', 'Food', 'Transport', 'Entertainment'],
      datasets: [
        {
          data: [450, 120, 45, 85],
          backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'], // Blue, Amber, Emerald, Purple
          borderWidth: 0,
        },
      ],
    };
  });
}
