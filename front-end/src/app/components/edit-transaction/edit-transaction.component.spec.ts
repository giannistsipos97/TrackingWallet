import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { EditTransactionComponent } from './edit-transaction.component';
import { TransactionService } from '../../services/transaction.service'; // 🟢 Adjust this path to your actual service location

describe('EditTransactionComponent', () => {
  let component: EditTransactionComponent;
  let fixture: ComponentFixture<EditTransactionComponent>;
  let transactionService: TransactionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTransactionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        TransactionService,
      ],
    }).compileComponents();

    transactionService = TestBed.inject(TransactionService);

    const mockData = {
      _id: 'mock-tx-123',
      date: new Date().toISOString(),
      name: 'Test Transaction',
      amount: 0,
    };

    const serviceKeys = Object.keys(transactionService) as Array<
      keyof TransactionService
    >;
    for (const key of serviceKeys) {
      const prop = transactionService[key];
      if (prop && typeof (prop as any).set === 'function') {
        try {
          (prop as any).set(mockData);
        } catch (e) {}
      }
    }

    const router = TestBed.inject(Router);
    spyOn(router, 'getCurrentNavigation').and.returnValue({
      extras: { state: { transaction: mockData } },
    } as any);

    fixture = TestBed.createComponent(EditTransactionComponent);
    component = fixture.componentInstance;

    const componentKeys = Object.keys(component) as Array<
      keyof EditTransactionComponent
    >;
    for (const key of componentKeys) {
      const prop = component[key];
      if (prop && typeof (prop as any).set === 'function') {
        try {
          (prop as any).set(mockData);
        } catch (e) {}
      }
    }

    if ('transaction' in component) {
      (component as any).transaction = mockData;
    }

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
