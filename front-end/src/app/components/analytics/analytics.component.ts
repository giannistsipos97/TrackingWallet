import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
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
  private accountService = inject(AccountService);

  transactions = signal<Transaction[]>([]);
  accounts = signal<Account[]>([]);
  selectedAccount = signal<Account | null>(null);
  selectedAccountId = signal<string>('');
  selectedYear = signal<string>(new Date().getFullYear().toString()); // Defaults to current year
  selectedMonth = signal<string>(
    String(new Date().getMonth() + 1).padStart(2, '0'),
  );

  activePeriod = computed(
    () => `${this.selectedYear()}-${this.selectedMonth()}`,
  );

  availableMonths = computed<string[]>(() => {
    const year = this.selectedYear();
    const months: string[] = [];

    for (let m = 1; m <= 12; m++) {
      months.push(`${year}-${String(m).padStart(2, '0')}`);
    }

    return months;
  });

  availableYears = computed<string[]>(() => {
    const yearsSet = new Set<string>();

    this.transactions().forEach((t) => {
      if (t.date) {
        yearsSet.add(t.date.substring(0, 4)); // Extracts 'YYYY'
      }
    });

    yearsSet.add(new Date().getFullYear().toString());

    return Array.from(yearsSet).sort().reverse();
  });

  formatMonthLabel(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  ngOnInit() {
    this.accountService.getAccounts().subscribe({
      next: (fetchedAccounts: Account[]) => {
        this.accounts.set(fetchedAccounts);

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

  filteredTransactions = computed(() => {
    const currentPeriod = this.activePeriod();
    return this.transactions().filter(
      (t) => t.date && t.date.startsWith(currentPeriod),
    );
  });

  // =========================================================
  // 📊 REAL-DATA BAR CHART CONFIGURATIONS
  // =========================================================
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { weight: 'bold' } } },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
      x: { grid: { display: false } },
    },
  };

  barChartData = computed<ChartData<'bar'>>(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    this.filteredTransactions().forEach((t) => {
      if (t.type === 'income') totalIncome += t.amount;
      if (t.type === 'expense') totalExpense += t.amount;
    });

    return {
      labels: [this.formatMonthLabel(this.activePeriod())],
      datasets: [
        {
          data: [totalIncome],
          label: 'Income',
          backgroundColor: '#10b981',
          borderRadius: 6,
        },
        {
          data: [totalExpense],
          label: 'Expenses',
          backgroundColor: '#f43f5e',
          borderRadius: 6,
        },
      ],
    };
  });

  // =========================================================
  // 📊 REAL-DATA DONUT CHART CONFIGURATIONS
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
    cutout: '70%',
  };

  donutChartData = computed<ChartData<'doughnut'>>(() => {
    const categoryTotals: { [key: string]: number } = {};

    this.filteredTransactions()
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const categoryName = t.category?.name || 'Other';
        categoryTotals[categoryName] =
          (categoryTotals[categoryName] || 0) + t.amount;
      });

    const labels = Object.keys(categoryTotals);
    const dataValues = Object.values(categoryTotals);

    return {
      labels: labels.length > 0 ? labels : ['No Expenses'],
      datasets: [
        {
          data: dataValues.length > 0 ? dataValues : [0],
          backgroundColor: [
            '#3b82f6',
            '#f59e0b',
            '#10b981',
            '#8b5cf6',
            '#ec4899',
            '#64748b',
          ],
          borderWidth: 0,
        },
      ],
    };
  });
}
