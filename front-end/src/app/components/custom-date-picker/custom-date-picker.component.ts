import { Component, computed, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-date-picker.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatePickerComponent),
      multi: true,
    },
  ],
})
export class CustomDatePickerComponent implements ControlValueAccessor {
  showCalendar = signal<boolean>(false);
  currentCalendarDate = signal<Date>(new Date());
  selectedValue = signal<string>('');

  weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  onChange: any = () => {};
  onTouched: any = () => {};

  calendarDays = computed(() => {
    const date = this.currentCalendarDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();

    const daysArray: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      daysArray.push(null);
    }
    for (let day = 1; day <= totalDays; day++) {
      daysArray.push(day);
    }
    return daysArray;
  });

  calendarHeader = computed(() => {
    return this.currentCalendarDate().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  });

  get formattedFormDate(): string {
    const rawDate = this.selectedValue();
    if (!rawDate) return 'Select Date';
    const [y, m, d] = rawDate.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      },
    );
  }

  writeValue(value: string): void {
    if (value) {
      this.selectedValue.set(value);
      const [y, m, d] = value.split('-');
      this.currentCalendarDate.set(new Date(Number(y), Number(m) - 1, 1));
    } else {
      const todayStr = new Date().toISOString().substring(0, 10);
      this.selectedValue.set(todayStr);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // 🟢 Actions
  changeMonth(direction: number): void {
    const current = this.currentCalendarDate();
    this.currentCalendarDate.set(
      new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  }

  selectDay(day: number | null): void {
    if (!day) return;
    const current = this.currentCalendarDate();
    const selectedDateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    this.selectedValue.set(selectedDateStr);
    this.onChange(selectedDateStr);
    this.onTouched();
    this.showCalendar.set(false);
  }

  isToday(day: number | null): boolean {
    if (!day) return false;
    const today = new Date();
    const current = this.currentCalendarDate();
    return (
      today.getDate() === day &&
      today.getMonth() === current.getMonth() &&
      today.getFullYear() === current.getFullYear()
    );
  }

  isSelected(day: number | null): boolean {
    if (!day || !this.selectedValue()) return false;
    const [y, m, d] = this.selectedValue().split('-');
    const current = this.currentCalendarDate();
    return (
      Number(d) === day &&
      Number(m) - 1 === current.getMonth() &&
      Number(y) === current.getFullYear()
    );
  }
}
