import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  signal,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-transaction',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ConfirmDialogComponent],
  templateUrl: './edit-transaction.component.html',
  styleUrl: './edit-transaction.component.scss',
})
export class EditTransactionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);

  @Input() transaction: any;
  @Input() categories: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<void>();

  isReadOnly = signal(true);
  isDeleting = signal(false);

  editForm!: FormGroup;

  constructor() {}

  ngOnInit(): void {
    const formattedDate = new Date(this.transaction.date)
      .toISOString()
      .split('T')[0];

    this.editForm = this.fb.group({
      description: [this.transaction.description, Validators.required],
      amount: [
        this.transaction.amount,
        [Validators.required, Validators.min(0.01)],
      ],
      date: [formattedDate, Validators.required],
      category: [
        this.transaction.category._id || this.transaction.category,
        Validators.required,
      ],
      type: [this.transaction.type],
    });
    this.editForm.disable();
  }

  toggleEdit() {
    this.isReadOnly.set(!this.isReadOnly());
    if (this.isReadOnly()) {
      this.editForm.disable();
    } else {
      this.editForm.enable();
    }
  }

  setTransactionType(newType: 'income' | 'expense'): void {
    if (this.isReadOnly()) return;

    this.editForm.patchValue({ type: newType });
    this.editForm.markAsDirty();
  }

  onSave() {
    if (this.editForm.valid) {
      this.transactionService
        .updateTransaction(this.transaction._id, this.editForm.value)
        .subscribe((res) => {
          console.log('Transaction updated successfully:', res);
          this.save.emit(res);
        });
    }
  }

  onDelete() {
    this.transactionService.deleteTransaction(this.transaction._id).subscribe({
      next: (res) => {
        this.isDeleting.set(false);
        this.delete.emit(res);
        this.close.emit();
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.isDeleting.set(false);
      },
    });
  }
}
