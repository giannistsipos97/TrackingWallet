import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  @Input() message: string = '';
  @Output() yes = new EventEmitter<void>();
  @Output() no = new EventEmitter<void>();
}
