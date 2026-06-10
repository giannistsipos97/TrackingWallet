import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account } from '../../models/Account';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/Category';
import { Transaction } from '../../models/Transaction';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { CustomDatePickerComponent } from '../custom-date-picker/custom-date-picker.component';

@Component({
  selector: 'app-add-transaction-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomDatePickerComponent],
  templateUrl: './add-transaction-dialog.component.html',
})
export class AddTransactionDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);

  categories = signal<Category[]>([]);

  @Input() account!: Account;
  @Input() type: 'income' | 'expense' = 'expense';
  @Output() close = new EventEmitter<void>();
  @Output() transactionSuccess = new EventEmitter<Account>();

  transactionForm = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    description: ['', [Validators.required, Validators.minLength(3)]],
    category: [null as Category | null, Validators.required],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
  });

  ngOnInit() {
    if (!this.account) {
      console.warn('No account context provided to AddTransactionDialog');
      //this.account = this.accountService.getDefaultAccount();
    }
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
      },
      error: (err) => {
        console.error('Error fetching categories in component:', err);
      },
    });
  }

  onSubmit() {
    const formValue = this.transactionForm.value;
    const user = this.authService.currentUser();

    if (this.transactionForm.valid && user?._id && this.account?._id) {
      const payload: any = {
        userId: user._id,
        accountId: this.account._id,
        amount: formValue.amount,
        description: formValue.description,
        category: formValue.category,
        type: this.type,
        date: formValue.date,
      };

      this.transactionService.createTransaction(payload).subscribe({
        next: (res) => {
          this.transactionSuccess.emit(res.account);
          this.close.emit();
        },
        error: (err) => console.error(err),
      });
    }
  }
}
